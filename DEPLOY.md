# 部署指南 - GitHub Pages + Fly.io

## 概述

使用 GitHub Pages 部署前端，Fly.io 部署后端，完全免费且支持持久化存储。

## 第一步：准备代码（已完成 ✅）

代码已配置好 Fly.io 的部署文件：
- `fly.toml` - Fly.io 配置
- `Dockerfile` - 用于部署的 Docker 镜像

## 第二步：部署后端到 Fly.io

### 2.1 注册 Fly.io

1. 访问 https://fly.io/
2. 点击 "Get Started"
3. 使用邮箱或 GitHub 账号注册
4. （可选）需要绑定信用卡验证以获得免费额度（不会扣费，除非超过免费限制）

### 2.2 安装 Fly.io CLI

在你的本地终端运行：

```bash
# 下载安装 Fly CLI（Windows）
iwr https://fly.io/install.ps1 -useb | iex

# 或使用 npm（推荐）
npm install -g @flydotio/flyctl
```

### 2.3 登录 Fly.io

```bash
fly auth login
```

这会打开浏览器让你登录。

### 2.4 部署应用

在项目根目录运行：

```bash
# 初始化应用（会使用已有的 fly.toml 配置）
fly launch --now

# 创建磁盘卷（持久化存储）
fly volumes create data --size 3 --region hkg

# 部署应用
fly deploy
```

### 2.5 设置密钥

```bash
# 设置 JWT_SECRET
fly secrets set JWT_SECRET=$(openssl rand -hex 32)

# 查看所有密钥
fly secrets list
```

## 第三步：配置 GitHub Pages（已完成 ✅）

GitHub Pages 已配置好，只需推送代码即可自动部署。

## 第四步：配置 GitHub Secrets

等 Fly.io 部署完成，获得你的后端 URL（类似 `https://social-app-backend.fly.dev`）：

1. 访问 https://github.com/goudanw12/desktop-tutorial/settings/secrets/actions
2. 点击 "New repository secret"
3. 添加以下密钥：

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://social-app-backend.fly.dev/api`（替换为你的实际 URL） |

## 第五步：推送代码触发部署

```bash
git add .
git commit -m "Update for Fly.io deployment"
git push origin main
```

GitHub Actions 会自动构建并部署前端到 GitHub Pages。

## 部署完成后的访问地址

- **前端**: `https://goudanw12.github.io/desktop-tutorial`
- **后端**: `https://social-app-backend.fly.dev`

## Fly.io 常用命令

```bash
# 查看应用状态
fly status

# 查看日志
fly logs

# 进入应用容器
fly ssh console

# 重启应用
fly apps restart social-app-backend

# 更新应用
fly deploy

# 查看资源使用情况
fly scale show
```

## Fly.io 免费额度

- ✅ 最多 3 个共享 CPU VM（256MB RAM 每个）
- ✅ 3GB 持久化存储卷
- ✅ 每月 160GB 出站流量
- ✅ 免费 SSL 证书
- ✅ 自动 CDN

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
- **部署**: GitHub Pages（前端）+ Fly.io（后端）
