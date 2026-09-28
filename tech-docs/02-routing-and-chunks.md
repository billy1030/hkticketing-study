# 02 - 前端路由體系與 Webpack 分包策略

## 1. UmiJS 路由映射機制

HK Ticketing 前端工程採用阿里開源的 **UmiJS (Webpack 5)** 構建，生產環境構建產物為 https://g.alicdn.com/maizuo/mz-web/0.0.201/。

前端代碼利用非同步動態加載（import()），將業務模組切分為數十個按需加載的 Chunk。系統根據 URL 路由動態下載對應的 JS Chunk，大幅降低初始首屏渲染時間（FCP）。

---

## 2. 核心路由清單與 Chunk 映射表

根據逆向分析提取自 outes.json，系統核心路由與分包編號如下：

### 2.1 排隊與等待模組 (Waiting & Diversion)
- **Chunk 8545**: p__waitingRoom__index
  - **URL 路由**: /waitingRoom 或 /allEvents/waitingRoom
  - **核心職責**: 等候室排隊、靜態/動態探測調度、多分頁互斥鎖、進度條渲染、權限資格獲取。
- **Chunk 4614**: p__diversion__index
  - **URL 路由**: /diversion
  - **核心職責**: 全局錯誤分流、超載引流頁面（CMS 錯誤提示與重新載入引導）。
- **Chunk 9728**: p__paymentWaiting__index
  - **URL 路由**: /paymentWaiting
  - **核心職責**: 訂單發起支付後的結果異步等待頁（短輪詢 /api/maipay2/doSyncNotifyQuery）。

### 2.2 售票與選座核心流程 (Ticket Sale Flow)
- **Chunk 2872**: p__ticketSale__entry__index (購票入口校驗)
- **Chunk 1950**: p__ticketSale__detail__index (活動詳情頁，項目簡介、場次列表)
- **Chunk 1522**: p__ticketSale__sellTicket__index (選票檔次與張數配置)
- **Chunk 6109**: p__ticketSale__selectSeat__index (交互式座位圖選座，SVG/Canvas 渲染)
- **Chunk 9770**: p__ticketSale__previewSeat__index (鎖座結果預覽與確認)
- **Chunk 349 / 576**: p__ticketSale__previewGAStand__index (企位/站票 GA 區域預覽)
- **Chunk 7397**: p__shopcart__index (購物車與臨時鎖座倒計時)
- **Chunk 6118**: p__ticketSale__confirmOrder__index (訂單確認與購買者信息填寫)
- **Chunk 5634**: p__ticketSale__cashier__index (收銀台結算頁)
- **Chunk 5786**: p__ticketSale__qrPay__index (二維碼掃碼支付)

### 2.3 用戶帳號與中心模組 (Account & User Center)
- **Chunk 1206 / 6521**: p__account__login__index / p__account__login__account__index (帳號密碼登入)
- **Chunk 129**: p__account__login__phone__index (手機短信驗證碼登入)
- **Chunk 5763**: p__account__login__infoSupplement__index (實名制信息補充與資料完善)
- **Chunk 8232**: p__userCenter__order__orderList__index (我的訂單列表)
- **Chunk 261**: p__userCenter__order__orderDetail__index (訂單詳情與電子票憑證)
- **Chunk 909**: p__userCenter__accessRestriction__index (IP 或帳號限制封禁提示頁)

---

## 3. 路由跳轉與參數傳遞協定 (Route Query Protocol)

在各個頁面流轉中，系統使用了一組嚴格的 Query 參數以維持購票上下文狀態：

```text
/allEvents/detail?projectId=12345
        │
        │ (觸發排隊判定)
        ▼
/waitingRoom?projectId=12345&visibleToken=VT_XYZ&privilegeCodePrifixState=CODE
        │
        │ (排隊通過，由 _() 函數攜帶 Token 自動 replace 路由)
        ▼
/allEvents/detail/selectTicket?activityId=12345&visibleToken=VT_XYZ&previewToken=PT_ABC&bizScene=DEFAULT
```

- projectId / ctivityId：節目活動唯一標識符。
- isibleToken：針對特權場次、信用卡優先購票、會員預售所必須的入場權益憑證。
- previewToken：從等候室放行時獲得的通行資格憑證，防止用戶跳過排隊直接請求選座接口。
- privilegeCodePrifixState：優惠代碼/優先購票代碼前綴校驗標識。
