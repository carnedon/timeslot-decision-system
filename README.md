# 時段決策系統 — 開會時間搶奪大賽 (20分鐘天課)

本專案為結合 **GitHub Pages** 靜態網站託管與 **Google Sheets (Google Apps Script)** 雲端資料庫的互動式開會時段決策系統。

## 1. 專屬 Google Sheets 資料庫

* **試算表名稱**：[時段決策系統_資料庫 (開會時間搶奪大賽)](https://docs.google.com/spreadsheets/d/14aPkJxFY13HbSLrWFiOVGhuJkaDaGzVVjJUwYcKAIGA/edit)
* **Spreadsheet ID**：`14aPkJxFY13HbSLrWFiOVGhuJkaDaGzVVjJUwYcKAIGA`
* **內建工作表結構**：
  * `Selections`：儲存 6 位投票者與 2 位管理員的學號、暱稱、星座代號、可選時段、首選時段、候補時段、30 面骰點數 (`d30Roll`) 與最終分配時段。
  * `TimeSlots`：儲存 `11/16 (一)` 與 `11/19 (四)` 共 8 個時段 (`slot_1` ~ `slot_8`) 與衝堂規則。
  * `SystemConfig`：儲存全域設定（如 `forceRevealThu` 強制公布開關、`lastUpdated` 時間戳記）。

---

## 2. 啟用 Google Sheets 雲端即時讀寫 API (只需 1 分鐘)

1. 開啟已為您建立好的 Google 試算表：[時段決策系統_資料庫 (開會時間搶奪大賽)](https://docs.google.com/spreadsheets/d/14aPkJxFY13HbSLrWFiOVGhuJkaDaGzVVjJUwYcKAIGA/edit)。
2. 點選上方選單 **「擴充功能 (Extensions)」>「Apps Script」**。
3. 將本專案中的 `Code.gs` 程式碼完整貼上並取代預設內容，按 `Ctrl + S` 儲存。
4. 點選右上角 **「部署 (Deploy)」>「新增部署作業 (New deployment)」**：
   * **選取類型**：網頁應用程式 (Web app)
   * **執行身分 (Execute as)**：**我 (Me)**
   * **誰可以存取 (Who has access)**：**所有人 (Anyone)**
5. 點選「部署」並授權後，複製產生的 **網頁應用程式網址 (`https://script.google.com/macros/s/.../exec`)**。
6. 使用管理員學號（`114607505` 或 `114602006`）登入網站後台，在下方 **「Google Sheets 即時資料庫串接中樞」** 貼上該網址並點選「儲存端點」（或直接將網址填入 `index.html` 內的 `DEFAULT_GAS_WEB_APP_URL` 常數中）。

---

## 3. 部署至您的 GitHub Repository (`carnedon`)

您可以將此專案推送至您的 GitHub 帳號 (`https://github.com/carnedon`) 並自動透過 GitHub Actions 發布為 GitHub Pages 網站：

```bash
git init
git add index.html Code.gs README.md .github/workflows/deploy.yml
git commit -m "feat: 初始化時段決策系統與 Google Sheets 資料庫串接"
git branch -M main
git remote add origin https://github.com/carnedon/<您的Repository名稱>.git
git push -u origin main
```

推送完成後，前往 GitHub Repository 的 **Settings > Pages**，將 **Build and deployment > Source** 設定為 **GitHub Actions**（或 **Deploy from a branch (`main` / `/root`)**），即可透過 `https://carnedon.github.io/<您的Repository名稱>/` 正式存取網站。
