# Vera Prompt Vault

獨立站。技術架構與 Komori Prompt Vault 相同：

- Vercel 只部署極小的 `index.html` 靜態啟動頁。
- 實際 App 由 Supabase Edge Function `vera-prompt-vault-app-loader` 載入。
- Loader 再指向固定版本 `vera-prompt-vault-app-loader-v100`。
- 收藏、最近、常用、待生成使用 Vera 自己的 localStorage key。
- 不修改、不依賴 Komori 網站首頁或 Komori loader 的路由邏輯。
