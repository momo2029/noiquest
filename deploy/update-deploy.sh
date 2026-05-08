#!/bin/bash

# NOI Quest 代码更新部署脚本
# 只更新代码和数据库迁移，不删除数据
# 从本地执行，自动上传代码到服务器并部署

set -e

echo "=========================================="
echo "  NOI Quest 代码更新部署"
echo "  (保留数据库数据)"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 配置
SERVER="root@45.78.235.129"
REMOTE_DIR="/opt/noiquest"
DOMAIN="noiquest.com"
REMOTE_BLOG_DIR="/var/www/blog"

echo "本地项目目录: $PROJECT_DIR"
echo "目标服务器: $SERVER:$REMOTE_DIR"
echo ""

# 检查本地项目目录
if [ ! -f "$PROJECT_DIR/deploy/docker-compose.yml" ]; then
    echo -e "${RED}错误: 未找到 docker-compose.yml，请确保在正确的项目目录中${NC}"
    exit 1
fi

echo -e "${YELLOW}[1/4] 上传代码到服务器...${NC}"
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '*.log' \
    --exclude '.env' \
    "$PROJECT_DIR/" "$SERVER:$REMOTE_DIR/"

# 复制 .env.production 到服务器的 deploy/.env
echo "复制环境变量配置..."
scp "$PROJECT_DIR/backend/.env.production" "$SERVER:$REMOTE_DIR/deploy/.env"



echo ""
echo -e "${YELLOW}[2/4] 停止现有服务...${NC}"
ssh $SERVER "cd $REMOTE_DIR/deploy && docker-compose stop backend frontend"

# 复制前端构建文件到Nginx目录
ssh $SERVER "mkdir -p /usr/share/nginx/html/noiquest"

# 复制Nginx配置
echo "复制Nginx配置..."
scp "$PROJECT_DIR/deploy/noiquest-nginx.conf" "$SERVER:/tmp/noiquest-nginx.conf"
ssh $SERVER "cp /tmp/noiquest-nginx.conf /etc/nginx/sites-available/noiquest.conf && ln -sf /etc/nginx/sites-available/noiquest.conf /etc/nginx/sites-enabled/"

echo ""
echo -e "${YELLOW}[3/4] 重新构建并启动服务...${NC}"
# 重建 backend 和 frontend
ssh $SERVER "cd $REMOTE_DIR/deploy && docker-compose up -d --build backend frontend"

echo ""
echo -e "${YELLOW}[4/4] 等待服务启动并检查状态...${NC}"
sleep 5
ssh $SERVER "cd $REMOTE_DIR/deploy && docker-compose ps"

# 重启Nginx应用新配置
echo "重启Nginx服务..."
ssh $SERVER "nginx -t && systemctl reload nginx"

# 检查后端日志确认数据库连接成功
echo ""
echo "最近的后端日志:"
ssh $SERVER "cd $REMOTE_DIR/deploy && docker-compose logs --tail=20 backend"

echo ""
echo -e "${GREEN}=========================================="
echo "  代码更新部署完成!"
echo "==========================================${NC}"
echo ""
echo "访问地址: https://$DOMAIN"
echo ""
echo "查看完整日志:"
echo "  ssh $SERVER 'cd $REMOTE_DIR/deploy && docker-compose logs -f'"
echo ""
echo "如果需要手动执行数据库迁移:"
echo "  ssh $SERVER 'cd $REMOTE_DIR/deploy && docker-compose exec backend npx prisma migrate deploy'"
echo ""
