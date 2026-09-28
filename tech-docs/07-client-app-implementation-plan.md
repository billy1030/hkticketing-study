# 07 - HK Ticketing 重構客戶端實施計劃書 (Implementation Plan)

## 1. 專案目標與定位

基於對 HK Ticketing（大麥/麥座現代化微前端與阿里雲架構）的深度逆向成果，本專案旨在構建一個現代化、輕量、高併發感知的 **HK Ticketing 專業搶票與監控客戶端（桌面端 Tauri + React / Vite）**。

與傳統瀏覽器相比，該客戶端具備以下核心競爭力：
1. **極速排隊感應 (Zero-Render Overhead)**：雙軌等候室探測（wr-static + API），毫秒級截獲放行 previewToken。
2. **多插槽並行排隊 (Multi-Slot Queueing)**：獨立 Storage 隔間，突破官方 Tab Mutex 單分頁限制。
3. **風控雙向交接 (Hybrid Webview Handoff)**：智能檢測阿里雲 Baxia 人機滑塊與 3DS 支付，自動喚起輕量 Webview 由真人無感介入，徹底規避算法封禁。

---

## 2. 系統架構分層 (System Architecture)

`
+-----------------------------------------------------------------------------------+
|                        Desktop Client UI (React 18 + Vite)                       |
|   • 活動監控面板  • 多插槽排隊進度視圖  • 購物車鎖座倒計時  • 音效警報設置        |
+-----------------------------------------------------------------------------------+
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
+------------------------------------+     +----------------------------------------+
|       Core Headless Engine         |     |        Hybrid Webview Manager          |
|      (Rust Backend / Node.js)      |     |           (Tauri Webview2)             |
|                                    |     |                                        |
|  1. 雙軌等候室探測 (wr-static/API) |     |  1. Baxia 587 滑塊彈窗攔截與自動回填   |
|  2. 多 Profile 隔離與 Tab 心跳偽裝 |     |  2. 登入 2FA / 短信驗證碼交互          |
|  3. 購物車快速鎖定與 API 重試       |     |  3. 最終銀行 3D-Secure 支付頁面跳轉    |
|  4. 支付結果 5s 短輪詢與自動通知   |     |  4. 提供原生合法 WebGL/Canvas 指紋     |
+------------------------------------+     +----------------------------------------+
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         ▼
                         [ HK Ticketing & Alibaba Cloud Edge ]
`

---

## 3. 分階段實施計劃 (Milestone Roadmap)

### Phase 1: 基礎架構搭建與活動監控模組 (Day 1 - 2)
- **目標**：搭建 Tauri + React/Vite 專案骨架，建立標準設計系統與活動元數據抓取。
- **交付產物**：
  1. 項目目錄規範（client-app/src、src-tauri、components、services）。
  2. eventService.ts：實現活動詳情 (/allEvents/detail)、場次票價矩陣、剩餘票檔實時刷新。
  3. 精確開售倒計時器（計算本地系統與伺服器時間偏差）。

### Phase 2: 雙軌等候室引擎與多插槽排隊 (Day 3 - 4)
- **目標**：實現核心排隊協議，突破 Tab Mutex 單頁限制。
- **交付產物**：
  1. waitingRoomEngine.ts：
     - 封裝 wr-static.maitix.com/check CDN 邊緣探測與 X-User-Id 標頭維護。
     - 封裝 /api/waitingRoom/queryQualified 動態資格查詢。
     - 實現 loadCycle、degradeLoad 動態退避調度器。
  2. slotManager.ts：多插槽管理，支援同時配置 2～3 個獨立會話（獨立 Cookie Jar 與虛擬 tabId）。
  3. 聲光警報模組：資格通過瞬間播放鈴聲（如 soundAlert.ts）並觸發 Windows 原生 Toast 通知。

### Phase 3: 鎖座狀態機與購物車管理 (Day 5 - 6)
- **目標**：實現排隊放行後的極速選座、企位（GA Stand）分配與購物車鎖定。
- **交付產物**：
  1. 	icketSaleService.ts：
     - 自動裝配 isibleToken、previewToken、projectId。
     - 鎖座請求與購物車生成 (/api/ticketSale/*)。
  2. 購物車 10~15 分鐘超時倒計時條與主動心跳保持。

### Phase 4: 阿里雲風控雙向交接與 Webview 橋接 (Day 7 - 8)
- **目標**：解決 Baxia 滑塊攔截與最終支付安全流轉。
- **交付產物**：
  1. axiaHandoff.ts：
     - 響應攔截器：監聽 HTTP 200 gv587_flag: sm 或狀態碼 429。
     - 自動彈出 400x300 浮動 Webview 窗口載入驗證頁。
     - 監聽驗證通過響應，提取更新後的 x5sec / cw_tc Cookie，回填後台客戶端並銷毀彈窗。
  2. paymentWaitingService.ts：
     - 發起 MaiPay 收銀台結算。
     - 自動 5 秒短輪詢 /api/maipay2/doSyncNotifyQuery。
     - 銀行 3DS 支付安全導出至默認瀏覽器完成刷卡。

### Phase 5: 系統聯調、效能壓測與打包發布 (Day 9 - 10)
- **目標**：全鏈路端到端模擬演練，跨平臺桌面打包。
- **交付產物**：
  1. 模擬演練環境（Mock Server 模擬排隊進度遞增、降級、放行與滑塊彈窗）。
  2. 產出 Windows .msi / .exe 及 macOS .dmg 安裝包。
