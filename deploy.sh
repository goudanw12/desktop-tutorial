#!/bin/bash

# ============================================================
# 社交应用一键部署脚本
# 使用前请确保已安装：git, node, npm
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的信息
info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 显示欢迎信息
echo "========================================"
echo "   社交应用一键部署脚本"
echo "========================================"
echo ""

# 检查必要工具
info "检查必要工具..."
check_command git
check_command node
check_command npm
success "所有必要工具已安装"

# 获取项目信息
read -p "请输入你的 GitHub 用户名: " GITHUB_USERNAME
read -p "请输入仓库名称 (默认: social-app): " REPO_NAME
REPO_NAME=${REPO_NAME:-social-app}
read -p "请输入 Render 服务名称 (默认: social-app-api): " RENDER_SERVICE_NAME
RENDER_SERVICE_NAME=${RENDER_SERVICE_NAME:-social-app-api}

REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME"

info "项目配置:"
echo "  GitHub 仓库: $REPO_URL"
echo "  Render 服务: $RENDER_SERVICE_NAME"
echo ""

# 确认继续
read -p "确认开始部署? (y/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    info "部署已取消"
    exit 0
fi

# 步骤1: 检查 Git 仓库
echo ""
info "步骤 1/5: 检查 Git 仓库..."

if [ ! -d ".git" ]; then
    warn "未找到 Git 仓库，正在初始化..."
    git init
    git branch -M main
fi

# 检查远程仓库
if ! git remote get-url origin &> /dev/null; then
    info "添加远程仓库..."
    git remote add origin "$REPO_URL"
else
    CURRENT_URL=$(git remote get-url origin)
    if [ "$CURRENT_URL" != "$REPO_URL" ]; then
        warn "远程仓库 URL 不匹配，正在更新..."
        git remote set-url origin "$REPO_URL"
    fi
fi
success "Git 仓库配置完成"

# 步骤2: 安装依赖并构建
echo ""
info "步骤 2/5: 安装依赖并构建项目..."

if [ ! -d "node_modules" ]; then
    info "安装依赖..."
    npm install
fi

info "构建前端..."
npm run build

info "构建后端..."
npm run build:server

success "项目构建完成"

# 步骤3: 提交代码到 GitHub
echo ""
info "步骤 3/5: 推送代码到 GitHub..."

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    info "检测到未提交的更改，正在提交..."
    git add .
    git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
fi

info "推送到 GitHub..."
if ! git push -u origin main; then
    error "推送失败，请检查:"
    echo "  1. GitHub 仓库是否已创建: https://github.com/new"
    echo "  2. 仓库名称是否正确: $REPO_NAME"
    echo "  3. 是否有推送权限（可能需要配置 SSH 或 Token）"
    echo ""
    echo "手动推送命令:"
    echo "  git remote add origin $REPO_URL"
    echo "  git branch -M main"
    echo "  git push -u origin main"
    exit 1
fi

success "代码已推送到 GitHub"

# 步骤4: 生成部署配置
echo ""
info "步骤 4/5: 生成部署配置文件..."

# 更新 render.yaml
cat > render.yaml << EOF
services:
  - type: web
    name: $RENDER_SERVICE_NAME
    runtime: node
    plan: free
    buildCommand: npm install && npm run build:server
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: JWT_SECRET
        generateValue: true
      - key: DATABASE_PATH
        value: /data/social.db
      - key: UPLOADS_DIR
        value: /data/uploads
    disk:
      name: data
      mountPath: /data
      sizeGB: 1
EOF

success "render.yaml 已生成"

# 步骤5: 输出部署指南
echo ""
info "步骤 5/5: 部署指南"
echo ""
echo "========================================"
echo "   部署步骤（请按顺序执行）"
echo "========================================"
echo ""

echo -e "${GREEN}1. 部署后端到 Render${NC}"
echo "   访问: https://dashboard.render.com"
echo "   点击: New + → Blueprint"
echo "   选择你的 GitHub 仓库"
echo "   Render 会自动读取 render.yaml 配置"
echo "   等待部署完成，记录服务 URL"
echo ""

echo -e "${GREEN}2. 部署前端到 Vercel${NC}"
echo "   访问: https://vercel.com/new"
echo "   导入同一个 GitHub 仓库"
echo "   配置:"
echo "     - Framework Preset: Vite"
echo "     - Build Command: npm run build"
echo "     - Output Directory: dist"
echo "   添加环境变量:"
echo "     - VITE_API_URL = https://$RENDER_SERVICE_NAME.onrender.com/api"
echo "   点击 Deploy"
echo ""

echo -e "${GREEN}3. 配置 CORS（重要）${NC}"
echo "   在 Render 控制台添加环境变量:"
echo "     - CORS_ORIGIN = https://你的前端域名.vercel.app"
echo "   然后点击 Manual Deploy → Clear Build Cache & Deploy"
echo ""

echo "========================================"
echo "   部署完成后的信息"
echo "========================================"
echo ""
echo "前端地址: https://你的前端域名.vercel.app"
echo "后端地址: https://$RENDER_SERVICE_NAME.onrender.com"
echo ""
echo "测试账号:"
echo "  用户名: alice_wang"
echo "  密码: 123456"
echo ""
echo "========================================"

success "一键部署脚本执行完成！"
info "请按照上述步骤手动完成云端部署"
