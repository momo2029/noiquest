#!/bin/bash

# 快速上传并部署脚本
# 在本地电脑运行此脚本

set -e

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

SERVER="root@28920.com"
REMOTE_DIR="/opt/noiquest"

echo "=========================================="
echo "  上传代码到服务器"
echo "=========================================="

echo "项目目录: $PROJECT_DIR"
echo "目标服务器: $SERVER:$REMOTE_DIR"
echo ""

# 创建远程目录
echo "[1/3] 创建远程目录..."
ssh $SERVER "mkdir -p $REMOTE_DIR"

# 上传代码（排除 node_modules 和其他不需要的文件）
echo "[2/3] 上传代码..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '*.log' \
    --exclude '.env' \
    --exclude '.env.development' \
    --include '.env.production' \
    "$PROJECT_DIR/" "$SERVER:$REMOTE_DIR/"

# 执行部署脚本
echo "[3/3] 执行部署..."
ssh $SERVER "chmod +x $REMOTE_DIR/deploy/deploy.sh && $REMOTE_DIR/deploy/deploy.sh"

echo ""
echo "=========================================="
echo "  部署完成!"
echo "=========================================="
echo "访问: https://${DOMAIN:-28920.com}"
