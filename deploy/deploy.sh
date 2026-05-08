#!/bin/bash

# NOI Quest 一键部署脚本
# 支持完整的生产环境部署

set -e

echo "========================================"
echo "  NOI Quest 一键部署"
echo "========================================"

# 配置
SERVER="root@45.78.235.129"
REMOTE_DIR="/opt/noiquest"
DOMAIN="noiquest.com"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查本地项目目录
if [ ! -f "deploy/docker-compose.yml" ]; then
    echo -e "${RED}错误: 请在项目根目录执行此脚本${NC}"
    exit 1
fi

echo -e "${YELLOW}[1/8] 上传代码和配置...${NC}"

# 上传所有文件
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '*.log' \
    --exclude '.env' \
    --exclude 'package-lock.json' \
    ./ "$SERVER:$REMOTE_DIR/"

echo -e "${YELLOW}[2/8] 复制环境变量...${NC}"
scp backend/.env.production "$SERVER:$REMOTE_DIR/deploy/.env"

echo -e "${YELLOW}[3/8] 停止现有服务...${NC}"
ssh $SERVER "cd $REMOTE_DIR/deploy && docker-compose down"

echo -e "${YELLOW}[4/8] 构建并启动服务...${NC}"
ssh $SERVER "cd $REMOTE_DIR/deploy && docker-compose up -d --build"

sleep 10

echo -e "${YELLOW}[5/8] 复制前端静态文件...${NC}"
ssh $SERVER "mkdir -p /usr/share/nginx/html/noiquest"
ssh $SERVER "docker cp noiquest_frontend:/usr/share/nginx/html/. /usr/share/nginx/html/noiquest/"

echo -e "${YELLOW}[6/8] 配置Nginx...${NC}"
scp deploy/noiquest-nginx-https.conf "$SERVER:/tmp/noiquest.conf"
ssh $SERVER "cp /tmp/noiquest.conf /etc/nginx/sites-available/noiquest.conf && ln -sf /etc/nginx/sites-available/noiquest.conf /etc/nginx/sites-enabled/"
ssh $SERVER "nginx -t && systemctl reload nginx"

echo -e "${YELLOW}[7/8] 运行数据库迁移...${NC}"
ssh $SERVER "cd $REMOTE_DIR/deploy && docker-compose exec backend npx prisma db push --skip-generate || true"

echo -e "${YELLOW}[8/8] 验证部署状态...${NC}"

# 检查服务状态
echo ""
echo "服务状态:"
ssh $SERVER "cd $REMOTE_DIR/deploy && docker-compose ps"

echo ""
echo "后端健康检查:"
ssh $SERVER "curl -s http://localhost:3001/health | head -1"

echo ""
echo "前端页面检查:"
ssh $SERVER "curl -k https://localhost/ | grep -o '<title>.*</title>'"

echo ""
echo -e "${GREEN}========================================"
echo "  部署完成!"
echo "========================================${NC}"
echo ""
echo "访问地址:"
echo "  HTTPS: https://$DOMAIN"
echo "  HTTP:  http://$DOMAIN (自动重定向到HTTPS)"
echo ""
echo "API端点:"
echo "  Health: https://$DOMAIN/api/health"
echo "  Status: https://$DOMAIN/status.html"
echo ""
echo "管理命令:"
echo "  查看日志: ssh $SERVER 'cd $REMOTE_DIR/deploy && docker-compose logs -f'"
echo "  重启服务: ssh $SERVER 'cd $REMOTE_DIR/deploy && docker-compose restart'"
echo "  更新代码: cd $PWD && ./deploy.sh"
echo ""

# 检查证书
echo "SSL证书状态:"
ssh $SERVER "certbot certificates | grep $DOMAIN" || echo "证书检查失败，请手动验证"