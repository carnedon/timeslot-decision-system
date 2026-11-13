#!/usr/bin/env bash
set -e

# 自動切換至腳本所在目錄，避免因執行路徑不同導致找不到檔案或 .git
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

REPO_NAME="timeslot-decision-system"
GITHUB_USER="carnedon"

echo "===================================================="
echo "🚀 準備建立並推送至 GitHub: ${GITHUB_USER}/${REPO_NAME}"
echo "📂 目前工作目錄: $(pwd)"
echo "===================================================="

# 強制重新初始化完整有效的 Git 儲存庫（避免解壓縮工具忽略隱藏檔 .git）
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "🔧 正在初始化本地 Git 儲存庫..."
  rm -rf .git
  git init
fi

git branch -M main
git add -A
git commit -m "feat: 部署時段決策系統網站與 Google Sheets 雲端資料庫串接" || true

if command -v gh &> /dev/null; then
  echo "📦 偵測到 GitHub CLI (gh)，正在自動建立公開儲存庫並推送..."
  gh repo create "${GITHUB_USER}/${REPO_NAME}" --public --source=. --remote=origin --push || {
    git remote remove origin 2>/dev/null || true
    git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
    git push -u origin main
  }
  echo "✅ 已成功建立並推送至 https://github.com/${GITHUB_USER}/${REPO_NAME}"
else
  echo "🔗 設定遠端儲存庫位址: https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
  git remote remove origin 2>/dev/null || true
  git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
  echo "⚠️ 請確認您已在 https://github.com/new 建立名為 '${REPO_NAME}' 的空白 Repository，接著開始推送..."
  git push -u origin main
  echo "✅ 推送完成！網址: https://github.com/${GITHUB_USER}/${REPO_NAME}"
fi
