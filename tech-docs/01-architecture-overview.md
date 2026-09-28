# 01 - HK Ticketing 系統架構與阿里雲生態概覽

## 1. 系統演進背景

舊版 HK Ticketing（快達票）長年採用傳統自建數據中心與單體購票系統，每逢大型演唱會（如陳奕迅、BLACKPINK、五月天等）開售即遭受嚴重的伺服器癱瘓與超載崩潰。

為徹底解決巨量併發衝擊，HK Ticketing 將底層技術底座全面遷移至 **阿里巴巴大麥/麥座（MaiZuo / Maitix）國際版技術體系（maizuo-intl-rwd）**，並深度整合阿里雲 CDN、WAF 邊緣防禦與人機識別風控中台。

---

## 2. 整體技術棧清單 (Full Tech Stack)

| 層次 | 採納技術 / 套件 | 具體實現與特點 |
| :--- | :--- | :--- |
| **前端應用框架** | React 17/18 + UmiJS 4 | 採用阿里開源的 UmiJS 微前端架構，按路由拆分為數十個 Webpack Chunks |
| **樣式與適應性** | Less / CSS Modules + RWD | 支援響應式斷點（PC、H5、App 內嵌 WebView）動態切換排版與交互模式 |
| **客戶端容器** | Web (Desktop/Mobile) & Flutter App | 移動端提供原生 Flutter App 容器，透過 hkt:// 原生協議進行 Hybrid 通信 |
| **邊緣與 CDN** | Alibaba Cloud ESA / ENS | 邊緣全站加速節點，具備微秒級動態分流與邊緣緩存能力 |
| **API 網關與路由** | Alibaba Cloud API Gateway / Kong | 統一路由管理，支援 /api/waitingRoom/*、/api/maipay2/*、/api/ticketSale/* |
| **排隊等待系統** | Maitix Waiting Room (Dual-Track) | 具備 CDN 靜態緩存探測 (wr-static.maitix.com) 與動態 API 雙軌降級架構 |
| **安全與人機識別** | AWSC + Baxia (baxiaCommon.js) | 阿里雲人機識別（NC/SC/Slider 滑塊），攔截腳本與自動化機器人 |
| **日誌與前端遙測** | Aplus (aplus_int.js) | 阿里前端日誌遙測，向 sg.mmstat.com 上報性能指標（FCP）與點擊行為 |
| **支付中台** | MaiPay 2 (/api/maipay2/*) | 整合信用卡、電子錢包（AlipayHK、WeChat Pay HK、FPS 等）及輪詢通知 |

---

## 3. 系統端到端請求流轉架構圖 (End-to-End Request Flow)

`
+-------------------------------------------------------------------------------+
|                             Client Browser / App                              |
|                                                                               |
|  [ React + UmiJS SPA ] <-----> [ LocalStorage Mutex / SessionStorage State ] |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
                        [ Alibaba Cloud Edge WAF ]
              (Cookie: acw_tc, cdn_sec_tc / Header: EagleId)
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
        [ Static Assets CDN ]                  [ API Gateway / WAF ]
    • g.alicdn.com/maizuo/mz-web             • Rate-limiting / Baxia Check
    • awsc.js / baxiaCommon.js                           │
                                                         ▼
                                          +-------------------------------+
                                          |     MaiZuo Backend System     |
                                          |                               |
                                          |  • Waiting Room Service       |
                                          |  • Ticket Engine (Seat Lock)  |
                                          |  • Order & MaiPay Service     |
                                          +-------------------------------+
                                                         │
                                                         ▼
                                          [ wr-static.maitix.com ]
                                         (Edge-cached Queue Probes)
`

---

## 4. 與傳統票務系統 (如 Cityline) 之對比分析

| 特性維度 | Cityline (傳統與現代混編) | HK Ticketing (麥座雲原生) |
| :--- | :--- | :--- |
| **前端架構** | 自研單頁/多頁 HTML + JS + WebAssembly | 現代化 React + UmiJS 4 分塊 SPA |
| **排隊機制** | 單一 API 輪詢 (/queue)，由伺服器派發 usy: true 與重試秒數 | **雙軌制**：邊緣靜態探測 (wr-static.maitix.com) + 伺服器 API 探測 |
| **多開防護** | 主要依賴 Cookie (queue_session, AWSALB) | **雙重防護**：Cookie + **LocalStorage Tab Mutex 互斥鎖**，跨分頁自動踢除 |
| **人機驗證** | Cloudflare Turnstile / 自研 WASM 遙測探針 | **阿里雲 AWSC / Baxia** 滑塊驗證與行為特徵分析 |
| **混合 App 整合** | 網頁獨立運作 | 深度整合 Flutter App（支援 hkt://flutter/order_pay_result 橋接） |
| **支付流程** | 重定向至外部銀行/第三方網關後返回 | **MaiPay 2** 內部收銀台，動態短輪詢確認支付結果 |
