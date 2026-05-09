# 重新部署指南 - 从零开始

## 第一步：清理本地 Git 仓库（可选）

如果你想完全重置本地仓库：

```bash
# 删除 .git 目录（会清除所有提交历史）
rm -rf .git

# 重新初始化 git
git init
git add .
git commit -m "Initial commit"
```

## 第二步：清理云端部署

### 2.1 删除 GitHub Pages 部署

1. 进入你的 GitHub 仓库
2. 点击 **Settings** → **Pages**
3. 在 **Build and deployment** 下：
   - 如果之前部署过，可以忽略，重新推送会覆盖
4. 在 **Environments** 下，可以删除旧的部署环境

### 2.2 删除 Render 服务（如果有）

1. 访问 https://dashboard.render.com
2. 找到你的 `social-app-backend` 服务
3. 点击服务进入详情页
4. 点击 **Settings**
5. 滚动到底部，点击 **Delete Service**
6. 确认删除

### 2.3 删除 Cloudflare Pages 项目（如果有）

1. 访问 https://dash.cloudflare.com
2. 进入 **Workers & Pages**
3. 找到你的项目并删除

### 2.4 删除 Vercel 项目（如果有）

1. 访问 https://vercel.com/dashboard
2. 找到你的项目，进入设置
3. 滚动到底部，点击 **Delete Project**

## 第三步：清理 GitHub Secrets

1. 进入你的 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 删除所有旧的 Secrets（如 `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID` 等）

## 第四步：重新开始

### 4.1 创建新的 GitHub 仓库（可选）

如果你想使用新仓库：

1. 访问 https://github.com/new
2. 创建新仓库
3. 更新本地 git remote：

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/NEW-REPO-NAME.git
git branch -M main
git push -u origin main
```

### 4.2 按新方案部署

现在你可以按照 [DEPLOY.md](file:///workspace/DEPLOY.md) 的步骤重新部署：

1. **部署后端到 Render**
2. **配置 GitHub Pages**
3. **配置 GitHub Secrets**
4. **推送代码自动部署**

## 快速清理命令

如果你想快速清理本地构建产物：

```bash
# 删除构建产物
rm -rf dist
rm -rf api/dist
rm -rf node_modules/.tmp

# 重新安装依赖
npm install
```

## 注意事项

⚠️ **删除操作不可逆**，请确认后再执行！

⚠️ 删除 Render 服务会同时删除数据库数据（如果没有备份）。

⚠️ 删除 GitHub 仓库会删除所有代码和提交历史。
