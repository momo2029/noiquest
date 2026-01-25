#!/bin/bash

# NOI Quest 部署脚本
# 域名: 28920.com

set -e

echo "=========================================="
echo "  NOI Quest 部署脚本"
echo "  域名: 28920.com"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 1. 更新系统并安装依赖
echo -e "${YELLOW}[1/7] 更新系统并安装依赖...${NC}"
apt-get update
apt-get install -y curl git apt-transport-https ca-certificates gnupg lsb-release

# 2. 安装 Docker
echo -e "${YELLOW}[2/7] 安装 Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}Docker 安装完成${NC}"
else
    echo -e "${GREEN}Docker 已安装${NC}"
fi

# 3. 安装 Docker Compose
echo -e "${YELLOW}[3/7] 安装 Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose 安装完成${NC}"
else
    echo -e "${GREEN}Docker Compose 已安装${NC}"
fi

# 4. 创建项目目录
echo -e "${YELLOW}[4/7] 创建项目目录...${NC}"
PROJECT_DIR="/opt/noiquest"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# 5. 克隆或更新代码
echo -e "${YELLOW}[5/7] 准备代码...${NC}"
if [ -d ".git" ]; then
    echo "更新代码..."
    git pull
else
    echo "请将代码上传到 $PROJECT_DIR"
    echo "您可以使用以下命令从本地上传:"
    echo "  scp -r /path/to/noiquest/* root@28920.com:$PROJECT_DIR/"
fi

# 6. 获取 SSL 证书
echo -e "${YELLOW}[6/7] 配置 SSL 证书...${NC}"
mkdir -p deploy/ssl

# 首先使用临时 nginx 配置获取证书
if [ ! -f "deploy/ssl/live/28920.com/fullchain.pem" ]; then
    echo "获取 Let's Encrypt SSL 证书..."

    # 创建临时 nginx 配置用于证书验证
    cat > /tmp/nginx-certbot.conf << 'NGINX_TEMP'
events {
    worker_connections 1024;
}
http {
    server {
        listen 80;
        server_name 28920.com www.28920.com;
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 200 'OK';
            add_header Content-Type text/plain;
        }
    }
}
NGINX_TEMP

    mkdir -p /var/www/certbot

    # 启动临时 nginx
    docker run -d --name temp_nginx \
        -p 80:80 \
        -v /tmp/nginx-certbot.conf:/etc/nginx/nginx.conf:ro \
        -v /var/www/certbot:/var/www/certbot \
        nginx:alpine

    sleep 3

    # 获取证书
    docker run --rm \
        -v $PROJECT_DIR/deploy/ssl:/etc/letsencrypt \
        -v /var/www/certbot:/var/www/certbot \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email 16983052@qq.com \
        --agree-tos \
        --no-eff-email \
        -d 28920.com \
        -d www.28920.com

    # 停止临时 nginx
    docker stop temp_nginx
    docker rm temp_nginx

    echo -e "${GREEN}SSL 证书获取成功${NC}"
else
    echo -e "${GREEN}SSL 证书已存在${NC}"
fi

# 7. 启动服务
echo -e "${YELLOW}[7/7] 启动服务...${NC}"
cd $PROJECT_DIR/deploy

# 停止旧容器
docker-compose down 2>/dev/null || true

# 构建并启动
docker-compose up -d --build

echo ""
echo -e "${GREEN}=========================================="
echo "  部署完成!"
echo "==========================================${NC}"
echo ""
echo "访问地址: https://28920.com"
echo ""
echo "测试账号:"
echo "  教师: teacher@test.com / 123456"
echo "  学生: student@test.com / 123456"
echo "  管理: admin@test.com / 123456"
echo ""
echo "常用命令:"
echo "  查看日志: docker-compose -f $PROJECT_DIR/deploy/docker-compose.yml logs -f"
echo "  重启服务: docker-compose -f $PROJECT_DIR/deploy/docker-compose.yml restart"
echo "  停止服务: docker-compose -f $PROJECT_DIR/deploy/docker-compose.yml down"
echo ""
