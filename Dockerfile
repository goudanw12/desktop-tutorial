# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci

# 复制源代码
COPY . .

# 构建前端和后端
RUN npm run build
RUN npm run build:server

# 生产阶段
FROM node:20-alpine

WORKDIR /app

# 安装生产依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api/dist ./api/dist
COPY --from=builder /app/api/data ./api/data

# 创建上传目录
RUN mkdir -p /app/uploads

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["node", "api/dist/server.js"]
