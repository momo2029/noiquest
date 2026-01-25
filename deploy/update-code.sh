#!/bin/bash

# 快速代码更新脚本
# 只上传代码并重启服务，不安装依赖

set -e

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

SERVER="root@28920.com"
REMOTE_DIR="/opt/noiquest"

echo "=========================================="
echo "  快速代码更新"
echo "=========================================="

echo "项目目录: $PROJECT_DIR"
echo "目标服务器: $SERVER:$REMOTE_DIR"
echo ""

# 上传代码（排除 node_modules 和其他不需要的文件）
echo "[1/2] 上传代码..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '*.log' \
    "$PROJECT_DIR/" "$SERVER:$REMOTE_DIR/"

# 重新构建并启动服务
echo "[2/2] 重启服务..."
ssh $SERVER "cd $REMOTE_DIR/deploy && docker-compose down && docker-compose up -d --build"

echo ""
echo "=========================================="
echo "  代码更新完成!"
echo "=========================================="
echo "访问: https://28920.com"
echo ""
echo "查看日志:"
echo "  ssh root@28920.com 'cd /opt/noiquest/deploy && docker-compose logs -f'"
