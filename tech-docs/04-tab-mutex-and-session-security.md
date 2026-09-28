# 04 - 多分頁互斥鎖 (Tab Mutex) 與會話安全防護

## 1. 什麼是 Tab Mutex（分頁互斥鎖）？

在傳統搶票場景中，黃牛或一般用戶常在同一瀏覽器中同時打開 10～20 個分頁試圖提高排隊中籤率。這會導致伺服器排隊資源大量被無效消耗。

HK Ticketing 麥座前端引入了高強度的 **客戶端分頁互斥防護協議（Tab Mutex Lock）**，保證同一瀏覽器、同一項目在同一時間 **只允許一個活動標籤頁維持排隊權益**。

---

## 2. 互斥鎖實現機制與數據結構

### 2.1 儲存鍵與數據結構
- **LocalStorage Key**: `WAITINGROOM_ACTIVE_TAB_{projectId}`
- **值格式 (JSON String)**:
  ```json
  {
    "tabId": "7k2v9z1837492a8b",
    "timestamp": 1727501234567
  }
  ```
- `tabId` 在組件掛載時由客戶端隨機生成：`Math.random().toString(36).slice(2) + Date.now().toString(36)`。

---

## 3. 互斥鎖狀態機與事件監聽

```
                    [ 當前標籤頁載入等候室 ]
                               │
                               ▼
                   [ 讀取 LocalStorage 鎖狀態 ]
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
      [ 鎖不存在或已過期 ]                  [ 鎖存在且由其他 Tab 持有 ]
      (timestamp > 15s)                     (timestamp <= 15s)
            │                                     │
            ▼                                     ▼
    [ 成功搶佔 Mutex 鎖 ]                 [ 標記為被踢出 (Inactive) ]
    • 寫入自身 tabId & timestamp          • 彈出 Tab 互斥遮罩或警告提示
    • 啟動 5s 心跳定時器續租              • 停止發送排隊探測請求
            │
            ├─────────────────────────────────────────────┐
            ▼                                             ▼
  [ 監聽 storage 跨分頁事件 ]                   [ 監聽 pagehide / visibilitychange ]
  • 若其他 Tab 覆寫了此 Key                     • 離開頁面立即釋放鎖 (removeItem)
  • 立即放棄當前排隊狀態                        • 頁面切回 (visible) 嘗試校驗續約
```

### 3.1 關鍵心跳續約與過期判斷源碼分析
```javascript
// 檢查並嘗試獲取鎖
var tryAcquireLock = function(projectId, tabId) {
  try {
    var record = getLockRecord(projectId);
    // 條件：無記錄、本身即持有者、或者已有記錄但距離上次心跳超過 15 秒（前一個 Tab 異常崩潰）
    return record 
      ? record.tabId === tabId || (Date.now() - record.timestamp > 15000 && saveLock(projectId, tabId)) 
      : saveLock(projectId, tabId);
  } catch(e) {
    return false;
  }
};

// 每 5 秒心跳維持自身鎖有效
heartbeatTimer = setInterval(function() {
  if (isActiveTab.current) {
    var record = getLockRecord(projectId);
    if (record?.tabId === tabId) {
      saveLock(projectId, tabId); // 刷新 timestamp
    } else {
      isActiveTab.current = false;
      setIsActive(false); // 失去鎖
    }
  }
}, 5000);
```

---

## 4. 防惡意刷新與離開防護 (Page Hide & Confirm Modal)

1. **防誤關閉與離開警告**:
   - 前端攔截 `beforeunload` 事件，彈出瀏覽器原生防護提示。
   - 點擊返回或首頁時，調用 `me()` 彈出麥座專用確認彈窗（`mz_wr_leave_title`: "您正在等候購票中"，`mz_wr_leave_message`: "如現時關閉或刷新此頁面將失去輪候資格，是否確認離開隊伍?"）。
2. **手動放棄隊伍 API**:
   - 若用戶主動點擊「確認離開」，前端向 API 發送 `POST /api/waitingRoom/quit`，通知服務端即刻釋放排隊資源，並調用 `releaseLock()` 移除 LocalStorage 標籤鎖。
3. **SessionStorage 排隊進入時間追蹤**:
   - 記錄 `WAITINGROOM_ENTER_TIME_{projectId}` 與進度 `WAITINGROOM_PROGRESS_{projectId}`，在換頁時供前端遙測計算總排隊延遲（`waiting_duration`）。
