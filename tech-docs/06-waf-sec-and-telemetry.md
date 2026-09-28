# 06 - 阿里雲 WAF 邊緣防護、Baxia 人機驗證與 Aplus 遙測

## 1. 阿里雲邊緣安全防護層 (Alibaba Cloud Edge Security)

HK Ticketing 構建於阿里雲邊緣安全加速架構之上，在請求進入業務服務器前需通過多道安全過濾網：

### 1.1 核心防護 Cookie 與 HTTP 標頭
- **`acw_tc` (Alibaba Cloud WAF Traffic Cookie)**:
  - 阿里雲 Web 應用防火牆分配的會話保持與節點調度 Token，用於識別異常速率或被標記的可疑 IP。
- **`cdn_sec_tc`**:
  - 邊緣安全節點分流驗證 Token，阻斷未經授權的代理節點與惡意爬蟲工具。
- **`EagleId` (阿里全鏈路追蹤標識)**:
  - 每個 HTTP 響應頭中包含 `EagleId`，由阿里 CDN 邊緣網關動態注入，用於審計每筆請求經過的邊緣節點路徑。

---

## 2. 阿里雲人機識別全家桶 (AWSC & Baxia)

在 `index.html` 中顯式引入了阿里巴巴風控核心腳本：

```html
<script src="//g.alicdn.com/??/AWSC/AWSC/awsc.js"></script>
<script src="//g.alicdn.com/sd/baxia-entry/baxiaCommon.js"></script>
```

### 2.1 AWSC (Alibaba Web Security Component)
- **職責**: 前端設備指紋生成與行為特徵提取。
- **檢測項**:
  - WebGL 指紋、Canvas 畫布渲染特徵
  - AudioContext 聲音指紋
  - `navigator.webdriver`、無頭瀏覽器環境（Headless Chrome / Playwright / Puppeteer）
  - 移動端陀螺儀與屏幕觸控特徵

### 2.2 Baxia (霸下 - 阿里統一驗證處置中心)
- **職責**: 阻斷攔截與動態驗證碼彈窗。
- **工作機制**:
  - 當用戶請求頻率過高或特徵異常時，服務端 API 不直接返回數據，而是返回特定狀態碼與 JSON（包含 `rgv587_flag: sm`）。
  - `baxiaCommon.js` 攔截 Axios / Fetch 響應，在前端無縫彈出滑塊驗證（NC / Slider）。
  - 用戶拖動滑塊通過後，Baxia 取得阿里雲風控認證 Token 並自動重發剛才被攔截的請求。

---

## 3. Aplus 遙測監控體系 (aplus_int.js)

`index.html` 配置了針對大麥國際站的專用埋點協議：

```html
<meta name="aplus-core" content="aplus.js">
<meta name="data-spm" content="maizuo-intl-rwd" data-spm-protocol="i">
<meta name="aplus-waiting" content="MAN">
<meta name="aplus-rhost-g" content="sg.mmstat.com">
<meta name="aplus-rhost-v" content="sg.mmstat.com">
```

- **SPM (Super Position Model)**: `maizuo-intl-rwd`，阿里黃金鏈路追蹤體系，跟蹤用戶在活動詳情、排隊室、收銀台的精確點擊路徑。
- **上報節點**: `sg.mmstat.com`（阿里雲新加坡海外遙測中心），確保香港及海外用戶低延遲上報。
- **首屏耗時 (FCP) 自定義探針**:
  ```javascript
  var timing = window.performance.timing;
  window.__tpp_start = timing.navigationStart || timing.fetchStart || +new Date();
  window.__tpp_perf_fcp = +new Date() - window.__tpp_start;
  ```
  上報頁面首屏渲染時間，輔助評估伺服器與 CDN 在高峰期承受的延遲壓力。
