# HK Ticketing (hkticketing.com) System Architecture & Reverse Engineering Study

> 本研究文檔針對 **HK Ticketing（香港快達票，hkticketing.com）** 全面升級改版後的現代化雲原生架構進行深入技術逆向分析。系統核心遷移至阿里雲與大麥/麥座（MaiZuo / Maitix）技術體系。

---

## 目錄結構與核心模組 (Documentation Index)

本技術研究專案包含以下深度架構專題文檔：

1. [01-architecture-overview.md](file:///c:/ai/hkticketing-study/tech-docs/01-architecture-overview.md) - 整體技術棧、阿里巴巴麥座體系、CDN 與網絡拓撲
2. [02-routing-and-chunks.md](file:///c:/ai/hkticketing-study/tech-docs/02-routing-and-chunks.md) - UmiJS 現代化前端路由清單、分包策略與核心頁面生命週期
3. [03-waiting-room-and-queue-protocol.md](file:///c:/ai/hkticketing-study/tech-docs/03-waiting-room-and-queue-protocol.md) - 等候室排隊協定、wr-static 靜態探測與動態降級雙軌機制
4. [04-tab-mutex-and-session-security.md](file:///c:/ai/hkticketing-study/tech-docs/04-tab-mutex-and-session-security.md) - 多分頁互斥鎖（Tab Mutex）、Storage 監聽與會話安全防護
5. [05-ticketing-stages-and-payment.md](file:///c:/ai/hkticketing-study/tech-docs/05-ticketing-stages-and-payment.md) - 購票全流程流轉：選座、購物車、MaiPay 支付等待與回調查詢
6. [06-waf-sec-and-telemetry.md](file:///c:/ai/hkticketing-study/tech-docs/06-waf-sec-and-telemetry.md) - 阿里雲 ESA/ENS CDN、AWSC、Baxia 滑塊驗證與 Aplus 遙測防禦

---

## 核心逆向發現摘要 (Key Architectural Insights)

`
[ 用戶客戶端 (Web / App Flutter) ]
               │
               ▼
[ Alibaba Cloud ESA / WAF Edge: acw_tc, cdn_sec_tc, EagleId ]
               │
       ┌───────┴────────────────────────┐
       ▼                                ▼
[ 靜態資源 (CDN / OSS) ]         [ API 網關 (Kong / Alibaba Gateway) ]
 • g.alicdn.com/maizuo/mz-web      • /api/waitingRoom/queryQualified
 • AWSC (awsc.js)                  • /api/waitingRoom/quit
 • Baxia (baxiaCommon.js)          • /api/maipay2/renderPay
 • Aplus (aplus_int.js)            • /api/maipay2/doSyncNotifyQuery
                                        │
                                        ▼
                         [ Maitix 麥座排隊引擎 ]
                         • wr-static.maitix.com/check
                         • 靜態 CDN 降級探測 + 權益 Token 驗證
`

### 1. 雙軌排隊與伺服器負載降級（Dual-Track Waiting Room）
與傳統 Cityline 的單一輪詢架構不同，HK Ticketing 採用了先進的 **雙軌動態探測架構**：
- **第一軌（CDN 邊緣靜態探測）**：https://wr-static.maitix.com/check?projectId={projectId}&cp={progress}，帶有自定義請求頭 X-User-Id。直接命中 CDN 緩存，極大減少後端資料庫負擔。
- **第二軌（API 動態資格查詢）**：/api/waitingRoom/queryQualified?projectId={projectId}&infoToken={infoToken}。
- **動態負載切換（Degrade Load Engine）**：當服務端返回 degradeLoad: true 時，前端自動在兩套探測機制間平滑切換，並自動採用 loadStart、loadCycle、degradeLoadStart、degradeLoadCycle 進行退避調度。

### 2. 瀏覽器分頁互斥防護（Tab Mutex Lock）
- 採用 WAITINGROOM_ACTIVE_TAB_{projectId} 寫入 localStorage，包含 { tabId, timestamp }。
- 每 5,000ms 心跳續租，逾期 15,000ms 允許搶佔。
- 透過 window.addEventListener( storage) 和 isibilitychange 實時監聽跨分頁行為，禁止用戶同時開啟多個標籤頁排隊，違規者立即被廢棄排隊資格。

### 3. 阿里巴巴安全全家桶整合
- **WAF 層**：cdn_sec_tc 與 cw_tc。
- **人機防護層**：阿里雲 AWSC（雲盾人機識別模組）與 Baxia（阿里雲統一安全驗證/滑塊攔截模組），攔截任何無頭瀏覽器（Puppeteer / Selenium）和異常請求特徵。
- **行為軌跡採集**：Aplus 遙測探針收集用戶鼠標軌跡、FCP 效能與指紋上報至 sg.mmstat.com。
