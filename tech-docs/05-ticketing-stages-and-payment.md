# 05 - 購票流程狀態機、座位鎖定與 MaiPay 支付

## 1. 購票完整生命週期 (Ticketing State Machine)

從用戶由排隊室被放行開始，系統進入高強度的即時交易鏈路：

```
[ 等候室放行 (帶 previewToken) ]
               │
               ▼
[ /selectTicket: 選座與票價檔次選擇 ]
               │
               ▼
[ /previewSeat 或 /previewGAStand: 鎖座預覽 ]
               │
               ▼
[ /shopcart: 購物車生成與倒計時鎖定 (Lock Timer) ]
               │
               ▼
[ /confirmOrder: 填寫實名信息、取票方式與優惠碼 ]
               │
               ▼
[ /cashier: MaiPay 收銀台結算 ]
               │
               ▼
[ /paymentWaiting: 支付異步確認與輪詢狀態機 ]
               │
               ├─────────────────────────┐
               ▼                         ▼
   [ 支付成功 (orderDetail) ]   [ 支付失敗 (paymentFailure) ]
```

---

## 2. 座位鎖定機制與超時防護

1. **鎖座時效 (Seat Hold Timer)**:
   - 用戶完成選座並提交進入購物車時，麥座引擎在 Redis 中創建分散式座位鎖。
   - 典型倒計時為 **10～15 分鐘**。若用戶未能在限時內提交訂單並支付，鎖自動釋放，座位重新回到公開票池。
2. **GA 企位（站票）與序號分配**:
   - 針對企位，系統不分配固定坐標，而是由後端分配排隊入場序號（`previewGAStand` 路由），按結算順序派發編號。

---

## 3. MaiPay 2 支付中台與輪詢狀態機分析

逆向提取自 `paymentWaiting.js` (Chunk 9728)，支付結果的確認採用了 **伺服器非同步通知 + 客戶端短輪詢備援機制**。

### 3.1 支付發起與渲染參數
`GET /api/maipay2/renderPay`
- `supplierClass`: `"pc"` / `"h5"` / `"app"`（根據環境自動適配支付渠道，如桌面網銀、手機移動支付或 App 內購）
- `container`: 容器識別碼（如 WeChat 內置瀏覽器、Alipay 錢包容器、原生 Webview）

### 3.2 支付結果異步輪詢 (`doSyncNotifyQuery`)
`GET /api/maipay2/doSyncNotifyQuery?pn={pn}&pt={pt}`
- 每隔 **5,000ms** 發送一次輪詢請求。
- **輪詢狀態判斷邏輯**:
  ```javascript
  (0, o.ti)({ pn: e.pn, pt: e.pt }).then(function(res) {
    if (res?.redirectUrl) {
      // 1. 第三方支付完成回調跳轉
      window.location.href = res.redirectUrl;
    } else if (res && +res.status === 200 && res.orderId) {
      // 2. 支付成功：提取訂單號，判斷是否為 Flutter 容器
      var orderNum = res.orderId.split("_")[0];
      if (isAppEnv) {
        bridgeCall({ url: "hkt://flutter/order_pay_result?isSuccess=true&orderNum=" + orderNum });
      } else {
        history.push("/payment?outer_payment_no=" + orderNum);
      }
    } else {
      // 3. 處理中：重置 5 秒定時器繼續輪詢
      poll();
    }
  }).catch(function(err) {
    // 4. 異常處理與失敗導向
    if (err?.dataCode !== CODE_ORDER_TIMEOUT) {
      if (isAppEnv) {
        bridgeCall({ url: "hkt://flutter/order_pay_result?isSuccess=false" });
      } else {
        history.push("/paymentFailure");
      }
    } else {
      navigateTo("/userCenter/orderList");
    }
  });
  ```
