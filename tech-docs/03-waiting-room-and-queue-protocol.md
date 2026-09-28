# 03 - 等候室排隊協定、靜態探測與降級調度

## 1. 核心設計架構：雙軌探測 (Dual-Track Probe)

在大型搶票高峰期，成千上萬的用戶集中在等候室發送輪詢請求。若所有請求均直接打向後端資料庫，即使透過 Redis 也極易造成雪崩。

HK Ticketing 麥座架構實現了極為精密的 **雙軌動態探測調度器**：

```
                    [ 等候室啟動調度循環 ]
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
       [ 正常軌道 (Normal) ]          [ 降級軌道 (Degrade) ]
               │                             │
    GET /api/waitingRoom/queryQualified       GET https://wr-static.maitix.com/check
   (攜帶 projectId & infoToken)             (攜帶 projectId & cp={progress})
               │                             │
               └──────────────┬──────────────┘
                              ▼
                    [ 檢查伺服器響應 Payload ]
                              │
     ┌────────────────────────┼────────────────────────┐
     ▼                        ▼                        ▼
[ 資格未通過 ]            [ 資格通過 (放行) ]      [ 狀態異常 / 關閉 ]
• 更新進度條 progress     • 提取 passEndTime       • 彈出項目不匹配提示
• 更新 degradeLoad 狀態   • 自動寫入 OrderTime     • 重定向回詳情頁
• 觸發退避定時器輪詢      • 跳轉 /selectTicket
```

---

## 2. 探測端點與參數詳解

### 2.1 軌道一：API 網關動態資格查詢
- **端點**: `GET /api/waitingRoom/queryQualified`
- **主要參數**:
  - `projectId`: 節目活動 ID
  - `infoToken`: 用戶進入排隊隊伍時所分配的會話憑證
- **返回值重要結構**:
  ```json
  {
    "projectId": "100234",
    "waitingroomStatus": 1,
    "userQualified": false,
    "progress": 42.5,
    "passEndTime": 1727500000000,
    "degradeLoad": false
  }
  ```

### 2.2 軌道二：CDN 邊緣靜態探測 (Maitix wr-static)
- **端點**: `GET https://wr-static.maitix.com/check?projectId={projectId}&cp={progress}`
- **環境開關**: 若處於預發布環境，追加 `&env=pre`
- **自定義請求頭**: `X-User-Id: {userId}`
- **特點**:
  - 部署於阿里雲邊緣 CDN 節點，靜態文件緩存更新，響應極為迅速。
  - 後端僅需定時由風控/負載系統向 CDN 推送全域或分段資格放行配置，客戶端請求無需直連交易資料庫。

---

## 3. 動態退避計時與降級邏輯 (Degrade Scheduling Algorithm)

排隊輪詢的時間間隔並非前端固定寫死，而是由後端下發的策略動態控制：

```javascript
// 摘自 waitingRoom.js 核心調度邏輯
loadStart: Number(config?.loadStart ?? 0),
loadCycle: Number(config?.loadCycle ?? 5000),             // 默認正常輪詢週期 5s
degradeLoadStart: Number(config?.degradeLoadStart ?? 0),
degradeLoadCycle: Number(config?.degradeLoadCycle ?? 5000) // 降級探測週期
```

### 調度狀態機工作過程：
1. **初始延遲啟動 (`m(D, 0, Y)`)**：
   - 根據當前是否處於降級狀態 (`C = j.current`)，選擇初始延遲時間 `loadStart` 或 `degradeLoadStart`。
2. **週期調度 (`m(n ? d : o, 0, Y)`)**：
   - 每次請求完成後，根據當前通道調度下一次探測，時間間隔精確對齊服務端下發的 `loadCycle` 或 `degradeLoadCycle`。
3. **無縫故障轉移 (Failover)**：
   - 當動態 API 請求發生網絡異常或超時（`catch` 分支），前端自動切換到靜態 CDN 探測 (`R(!0)`)，確保用戶不會因短暫的 API 波動而丟失排隊位置。

---

## 4. 排隊放行跳轉與 Token 傳遞流

當探測到 `userQualified === true` 或 `qualified === true` 時，前端觸發放行流程：

```javascript
var _ = function(passEndTime) {
  // 1. 終止所有心跳定時器
  stopTimers();
  // 2. 清理等候室配置，寫入排隊通過有效期 (passEndTime)
  f.Z.removeWaitingRoomConfig(projectId);
  if (typeof passEndTime === "number" && passEndTime > 0) {
    f.Z.setWaitingRoomOrderTime(projectId, passEndTime);
  }
  // 3. 構建跳轉 URL，注入 previewToken 與 visibleToken
  var targetUrl = "/allEvents/detail/selectTicket?activityId=" + projectId;
  if (visibleToken) targetUrl += "&visibleToken=" + visibleToken;
  if (privilegeCode) targetUrl += "&privilegeCodePrifixState=" + privilegeCode;
  
  var previewData = getPreviewToken();
  if (previewData?.previewToken) {
    targetUrl += "&previewToken=" + previewData.previewToken;
  }
  // 4. 計算排隊耗時並上報遙測數據
  var enterTime = sessionStorage.getItem("WAITINGROOM_ENTER_TIME_" + projectId);
  if (enterTime) {
    reportQueueDuration(projectId, Date.now() - Number(enterTime));
  }
  // 5. 無痕替換當前頁面歷史
  history.replace(targetUrl);
};
```
