#!/bin/bash

# NOI Quest 全新服务器安装脚本
# 从本地执行，通过 SSH 远程操作服务器
# 前提：已运行 get-ssl-cert.sh 获取证书
# 注意：数据库使用远程 10.0.0.1:5432，不在本地部署

set -e

echo "=========================================="
echo "  NOI Quest 全新安装脚本"
echo "  警告: 将删除服务器上所有现有数据!"
echo "  数据库: 使用远程 10.0.0.1:5432"
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
SERVER="root@noiquest.com"
REMOTE_DIR="/opt/noiquest"
DOMAIN="noiquest.com"
REMOTE_BLOG_DIR="/var/www/blog"

echo "本地项目目录: $PROJECT_DIR"
echo "目标服务器: $SERVER:$REMOTE_DIR"
echo "数据库地址: 10.0.0.1:5432"
echo ""

# 检查本地文件
if [ ! -f "$PROJECT_DIR/deploy/docker-compose.fresh.yml" ]; then
    echo -e "${RED}错误: 未找到 docker-compose.fresh.yml${NC}"
    exit 1
fi

if [ ! -f "$PROJECT_DIR/backend/.env.production" ]; then
    echo -e "${RED}错误: 未找到 backend/.env.production${NC}"
    exit 1
fi

if [ ! -d "$SCRIPT_DIR/ssl/live/$DOMAIN" ]; then
    echo -e "${RED}错误: 未找到 SSL 证书，请先运行 ./get-ssl-cert.sh 获取证书${NC}"
    exit 1
fi

# 确认操作
echo -e "${RED}警告: 此操作将删除服务器上的以下内容:${NC}"
echo "  - 所有 Docker 容器和数据卷"
echo "  - 项目目录 $REMOTE_DIR"
echo ""
echo -e "${YELLOW}注意: 数据库使用远程 10.0.0.1:5432，请确保数据库可访问${NC}"
echo ""
read -p "确定要继续吗? (输入 'yes' 确认): " confirm
if [ "$confirm" != "yes" ]; then
    echo "操作已取消"
    exit 0
fi

echo ""
echo -e "${YELLOW}[1/6] 检查服务器连接...${NC}"
ssh $SERVER "echo '服务器连接成功'"

echo ""
echo -e "${YELLOW}[2/6] 清理服务器...${NC}"
ssh $SERVER "
    cd $REMOTE_DIR/deploy 2>/dev/null && docker-compose down -v 2>/dev/null || true
    docker stop \$(docker ps -aq) 2>/dev/null || true
    docker rm \$(docker ps -aq) 2>/dev/null || true
    docker volume rm \$(docker volume ls -q | grep noiquest) 2>/dev/null || true
    rm -rf $REMOTE_DIR
    mkdir -p $REMOTE_DIR
    echo '清理完成'
"

echo ""
echo -e "${YELLOW}[3/6] 安装 Docker（如果需要）...${NC}"
ssh $SERVER "
    if ! command -v docker &> /dev/null; then
        echo '安装 Docker...'
        apt-get update
        apt-get install -y curl apt-transport-https ca-certificates gnupg lsb-release
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
        systemctl enable docker
        systemctl start docker
    else
        echo 'Docker 已安装'
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo '安装 Docker Compose...'
        curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    else
        echo 'Docker Compose 已安装'
    fi
"

echo ""
echo -e "${YELLOW}[4/6] 上传代码和证书...${NC}"
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '*.log' \
    --exclude '.env' \
    "$PROJECT_DIR/" "$SERVER:$REMOTE_DIR/"

# 复制环境变量
scp "$PROJECT_DIR/backend/.env.production" "$SERVER:$REMOTE_DIR/deploy/.env"

# 创建 certbot-webroot 目录
ssh $SERVER "mkdir -p $REMOTE_DIR/deploy/certbot-webroot"


echo ""
echo -e "${YELLOW}[5/6] 构建并启动服务...${NC}"
ssh $SERVER "cd $REMOTE_DIR/deploy && docker-compose -f docker-compose.fresh.yml up -d --build"

echo ""
echo -e "${YELLOW}[6/6] 检查服务状态...${NC}"
sleep 15
ssh $SERVER "cd $REMOTE_DIR/deploy && docker-compose -f docker-compose.fresh.yml ps"

echo ""
echo "后端日志:"
ssh $SERVER "cd $REMOTE_DIR/deploy && docker-compose -f docker-compose.fresh.yml logs --tail=30 backend"

echo ""
echo -e "${GREEN}=========================================="
echo "  安装完成!"
echo "==========================================${NC}"
echo ""
echo "访问地址: https://$DOMAIN"
echo ""
echo "测试账号："
echo "  教师: teacher@noiquest.com / 666999"
echo "  学生: student@noiquest.com / 666999"
echo "  管理员: admin@noiquest.com / 666999"
echo ""
echo "常用命令:"
echo "  查看日志: ssh $SERVER 'cd $REMOTE_DIR/deploy && docker-compose logs -f'"
echo "  重启服务: ssh $SERVER 'cd $REMOTE_DIR/deploy && docker-compose restart'"
echo ""
