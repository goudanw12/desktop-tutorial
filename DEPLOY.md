# 部署指南 - 让朋友也能使用你的社交应用

## 概述

本项目需要部署两个部分：
1. **前端** → Vercel（免费，自动部署）
2. **后端** → Render（免费，支持SQLite数据库）

---

## 第一步：准备代码

### 1.1 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名称：`social-app`（或其他你喜欢的名字）
3. 选择 **Public**（公开）或 **Private**（私有）
4. 点击 **Create repository**

### 1.2 上传代码到 GitHub

在终端中执行：

```bash
# 初始化 git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/social-app.git

# 推送代码
git branch -M main
git push -u origin main
```

---

## 第二步：部署后端到 Render

### 2.1 注册/登录 Render

1. 访问 https://render.com
2. 点击 **Get Started for Free**
3. 使用 GitHub 账号登录

### 2.2 创建 Web Service

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

5. 添加磁盘（用于持久化数据库）：
   - 点击 **Add Disk**
   - Name: `data`
   - Mount Path: `/data`
   - Size: `1 GB`

6. 点击 **Create Web Service**

7. 等待部署完成（约 2-3 分钟），记录服务 URL：
   ```
   https://social-app-backend-xxxxx.onrender.com
   ```

---

## 第三步：部署前端到 Vercel

### 3.1 注册/登录 Vercel

1. 访问 https://vercel.com
2. 点击 **Sign Up**
3. 使用 GitHub 账号登录

### 3.2 导入项目

1. 点击 **Add New...** → **Project**
2. 选择你的 `social-app` 仓库
3. 点击 **Import**

### 3.3 配置构建设置

1. **Framework Preset**: 选择 `Vite`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`

### 3.4 添加环境变量

点击 **Environment Variables**，添加：

| 变量名 | 值 |
|--------|-----|
| `VITE_API_URL` | `https://social-app-backend-xxxxx.onrender.com/api` |

> 注意：替换为你在 Render 上获得的真实后端 URL

### 3.5 部署

1. 点击 **Deploy**
2. 等待构建完成（约 1-2 分钟）
3. 部署成功后，Vercel 会提供一个域名：
   ```
   https://social-app-xxxxx.vercel.app
   ```

---

## 第四步：更新 CORS 配置

### 4.1 获取前端域名

复制 Vercel 提供的前端域名，例如：
```
https://social-app-xxxxx.vercel.app
```

### 4.2 更新 Render 环境变量

1. 回到 Render 控制台
2. 进入你的服务 **Settings**
3. 添加环境变量：

| 环境变量 | 值 |
|----------|-----|
| `CORS_ORIGIN` | `https://social-app-xxxxx.vercel.app` |

4. 点击 **Save Changes**，服务会自动重新部署

---

## 第五步：验证部署

1. 打开前端 URL：`https://social-app-xxxxx.vercel.app`
2. 尝试注册新账号
3. 尝试登录
4. 测试发布动态、点赞、评论等功能

---

## 常见问题

### Q: Render 免费版会休眠？
A: 是的，Render 免费版在 15 分钟无访问后会休眠。首次访问可能需要等待 30 秒唤醒。

### Q: 数据库数据会丢失吗？
A: 不会，因为我们配置了磁盘挂载，SQLite 数据库会持久化保存。

### Q: 如何更新代码？
A: 只需推送代码到 GitHub，Vercel 会自动重新部署前端，Render 也会自动重新部署后端。

```bash
git add .
git commit -m "更新功能"
git push
```

### Q: 图片上传后无法显示？
A: 确保 `UPLOADS_DIR` 环境变量设置为 `/data/uploads`，且 Render 磁盘已正确挂载。

### Q: 构建时出现 "ignoreDeprecations" 错误？
A: 这是 TypeScript 版本兼容性问题。已在 `api/tsconfig.json` 中添加了 `"ignoreDeprecations": "5.0"` 配置。如果仍然出错，请检查 Render 的 Node.js 版本是否为 18 或更高。

---

## 测试账号

部署完成后，可以使用以下测试账号：

| 用户名 | 密码 |
|--------|------|
| `alice_wang` | `123456` |
| `bob_zhang` | `123456` |
| `charlie_li` | `123456` |
| `diana_chen` | `123456` |
| `evan_liu` | `123456` |

---

## 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS + Zustand + Vite
- **后端**: Express 4 + TypeScript + SQLite (better-sqlite3)
- **部署**: Vercel（前端）+ Render（后端）
