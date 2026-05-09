# 部署指南 - GitHub Pages + Render

## 概述

使用 GitHub Pages 部署前端，Render 部署后端，完全免费且自动部署。

## 第一步：准备代码

### 1.1 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名称：`social-app`（或其他你喜欢的名字）
3. 选择 **Public**（公开）或 **Private**（私有）
4. 点击 **Create repository**

### 1.2 上传代码到 GitHub

在终端中执行：

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/social-app.git
git branch -M main
git push -u origin main
```

## 第二步：配置 GitHub Pages

### 2.1 启用 GitHub Pages

1. 进入你的 GitHub 仓库
2. 点击 **Settings** → **Pages**
3. 在 **Build and deployment** 下：
   - **Source**: 选择 `GitHub Actions`
4. 保存

### 2.2 配置 Secrets（可选，用于 Render 后端）

如果要部署后端，在 GitHub 仓库添加以下 Secrets：

1. 进入仓库 **Settings** → **Secrets and variables** → **Actions**
2. 添加以下 Secrets：
   - `VITE_API_URL`: 你的 Render 后端 API URL（如 `https://social-app-backend-xxxxx.onrender.com/api`）
   - `RENDER_API_KEY`: Render API Key（在 https://dashboard.render.com/profile/api-keys 获取）
   - `RENDER_SERVICE_ID`: Render 服务 ID（在 Render 服务页面 URL 中找到）

## 第三步：部署后端到 Render

### 3.1 注册/登录 Render

1. 访问 https://render.com
2. 点击 **Get Started for Free**
3. 使用 GitHub 账号登录

### 3.2 创建 Web Service

1. 点击 **New +** → **Web Service**
2. 选择你的 `social-app` 仓库
3. 填写配置：

| 配置项 | 值 |
|--------|-----|
| Name | `social-app-backend` |
| Runtime | `Node` |
| Build Command | `npm install && npm run build:server` |
| Start Command | `npm start` |
| Plan | `Free` |
| Node Version | `18`（在 Advanced 中设置）|

4. 点击 **Advanced** 添加环境变量：

| 环境变量 | 值 |
|----------|-----|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `JWT_SECRET` | 点击 **Generate** 自动生成 |
| `DATABASE_PATH` | `/data/social.db` |
| `UPLOADS_DIR` | `/data/uploads` |
| `CORS_ORIGIN` | `https://YOUR_USERNAME.github.io/social-app` |

5. 添加磁盘（用于持久化数据库）：
   - 点击 **Add Disk**
   - Name: `data`
   - Mount Path: `/data`
   - Size: `1 GB`

6. 点击 **Create Web Service**
7. 等待部署完成（约 2-3 分钟），记录服务 URL

## 第四步：配置前端 API URL

### 4.1 更新 GitHub Secrets

1. 在 GitHub 仓库中，进入 **Settings** → **Secrets and variables** → **Actions**
2. 添加 `VITE_API_URL`，值为你的 Render 后端 URL：
   ```
   https://social-app-backend-xxxxx.onrender.com/api
   ```

### 4.2 更新 Render CORS 配置

1. 在 Render 服务页面，进入 **Environment**
2. 更新 `CORS_ORIGIN` 为你的 GitHub Pages URL：
   ```
   https://YOUR_USERNAME.github.io/social-app
   ```

## 第五步：自动部署

现在，每当你推送代码到 `main` 分支：

1. GitHub Actions 会自动构建并部署前端到 GitHub Pages
2. 如果配置了 Render Secrets，会自动触发 Render 后端部署

你的网站会在：
- **前端**: `https://YOUR_USERNAME.github.io/social-app`
- **后端**: `https://social-app-backend-xxxxx.onrender.com`

## 常见问题

### Q: GitHub Pages 在中国访问慢？

A: GitHub Pages 在中国的访问速度取决于网络环境，但比 Cloudflare/Vercel 相对稳定一些。

### Q: Render 免费版会休眠？

A: 是的，Render 免费版在 15 分钟无访问后会休眠。首次访问可能需要等待 30 秒唤醒。

### Q: 数据库数据会丢失吗？

A: 不会，因为我们配置了磁盘挂载，SQLite 数据库会持久化保存。

### Q: 如何更新代码？

A: 只需推送代码到 GitHub，GitHub Actions 会自动重新部署。

### Q: 构建时出现 "ignoreDeprecations" 错误？

A: 这是 TypeScript 版本兼容性问题。已在 `tsconfig.json` 和 `api/tsconfig.json` 中都添加了 `"ignoreDeprecations": "5.0"` 配置。

## 测试账号

部署完成后，可以使用以下测试账号：

| 用户名 | 密码 |
|--------|------|
| `alice_wang` | `123456` |
| `bob_zhang` | `123456` |
| `charlie_li` | `123456` |
| `diana_chen` | `123456` |
| `evan_liu` | `123456` |

## 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS + Zustand + Vite
- **后端**: Express 4 + TypeScript + SQLite (better-sqlite3)
- **部署**: GitHub Pages（前端）+ Render（后端）
