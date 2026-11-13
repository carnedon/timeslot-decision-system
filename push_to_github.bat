@echo off
chcp 65001 >nul
cd /d "%~dp0"

set REPO_NAME=timeslot-decision-system
set GITHUB_USER=carnedon

echo ====================================================
echo 🚀 準備建立並推送至 GitHub: %GITHUB_USER%/%REPO_NAME%
echo 📂 目前工作目錄: %CD%
echo ====================================================

git rev-parse --is-inside-work-tree >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo 🔧 正在初始化本地 Git 儲存庫...
  if exist ".git" rmdir /s /q ".git"
  git init
)

git branch -M main
git add -A
git commit -m "feat: 部署時段決策系統網站與 Google Sheets 雲端資料庫串接"

where gh >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  echo 📦 偵測到 GitHub CLI ^(gh^)，正在自動建立公開儲存庫並推送...
  gh repo create "%GITHUB_USER%/%REPO_NAME%" --public --source=. --remote=origin --push
  if %ERRORLEVEL% NEQ 0 (
    git remote remove origin 2>nul
    git remote add origin "https://github.com/%GITHUB_USER%/%REPO_NAME%.git"
    git push -u origin main
  )
) else (
  echo 🔗 設定遠端儲存庫: https://github.com/%GITHUB_USER%/%REPO_NAME%.git
  git remote remove origin 2>nul
  git remote add origin "https://github.com/%GITHUB_USER%/%REPO_NAME%.git"
  echo ⚠️ 請確認您已在 https://github.com/new 建立名為 "%REPO_NAME%" 的空白 Repository，接著開始推送...
  git push -u origin main
)
echo ✅ 完成！請前往 https://github.com/%GITHUB_USER%/%REPO_NAME%/settings/pages 確認 GitHub Pages 狀態。
pause
