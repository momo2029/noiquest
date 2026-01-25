# 生产阶段
FROM node:20-alpine AS production

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm ci

# 复制源代码
COPY . .

# 生成 Prisma 客户端
RUN npm run db:generate

# 暴露端口
EXPOSE 3001

# 启动命令（使用 tsx 直接运行）
CMD ["npx", "tsx", "src/index.ts"]
