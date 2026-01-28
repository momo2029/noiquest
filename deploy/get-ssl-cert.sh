#!/bin/bash

# SSL 证书获取脚本
# 在服务器上获取 Let's Encrypt 证书，然后下载到本地 deploy/ssl 目录

set -euo pipefail  # 增强错误处理：未定义变量报错、管道失败整体退出

echo "==========================================="
echo "  SSL 证书获取脚本"
echo "==========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 错误处理函数
error_exit() {
    echo -e "${RED}[错误] $1${NC}" >&2
    exit 1
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 配置（请确认信息正确）
SERVER="root@noiquest.com"
DOMAIN="noiquest.com"
CERTBOT_EMAIL="cobola@126.com"
REMOTE_CERT_DIR="/tmp/noiquest-ssl"
LOCAL_SSL_DIR="$SCRIPT_DIR/ssl"

echo "域名: $DOMAIN"
echo "本地证书目录: $LOCAL_SSL_DIR"
echo ""

# 检查服务器连接
echo -e "${YELLOW}[1/4] 检查服务器连接...${NC}"
if ! ssh "$SERVER" "echo '服务器连接成功'" &>/dev/null; then
    error_exit "无法连接到服务器 $SERVER，请检查 SSH 配置/服务器地址"
fi
echo -e "${GREEN}服务器连接成功${NC}"

# 在服务器上获取证书
echo ""
echo -e "${YELLOW}[2/4] 在服务器上获取证书...${NC}"

# 关键修复：heredoc 用 "" 包裹 EOF_SSH 避免本地变量提前解析，改用远程定义变量
ssh "$SERVER" << "EOF_SSH"
    set -euo pipefail  # 远程执行也开启严格错误处理

    # 手动定义远程需要的变量（避免本地传递解析异常）
    REMOTE_CERT_DIR="/tmp/noiquest-ssl"
    DOMAIN="noiquest.com"
    CERTBOT_EMAIL="cobola@126.com"

    # 清理旧的临时目录
    rm -rf "$REMOTE_CERT_DIR" || true
    mkdir -p "$REMOTE_CERT_DIR/certbot-webroot/.well-known/acme-challenge" || {
        echo "创建证书临时目录失败" >&2
        exit 1
    }

    # 停止可能占用 80 端口的容器
    docker stop temp_nginx 2>/dev/null || true
    docker rm temp_nginx 2>/dev/null || true
    docker stop noiquest_nginx 2>/dev/null || true

    # 启动临时 nginx（增加--restart=no 避免开机自启）
    echo '启动临时 nginx...'
    docker run -d --name temp_nginx \
        --restart=no \
        -p 80:80 \
        -v "$REMOTE_CERT_DIR/certbot-webroot:/usr/share/nginx/html" \
        nginx:alpine || {
            echo "临时 Nginx 启动失败" >&2
            exit 1
        }

    # 延长等待时间，确保 Nginx 完全启动（3秒可能不足）
    sleep 8

    # 获取证书（关键：所有参数用引号包裹，避免空格/特殊字符解析问题）
    echo '获取 Let'\''s Encrypt 证书...'
    docker run --rm \
        -v "$REMOTE_CERT_DIR/ssl:/etc/letsencrypt" \
        -v "$REMOTE_CERT_DIR/certbot-webroot:/var/www/certbot" \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$CERTBOT_EMAIL" \
        --agree-tos \
        --no-eff-email \
        --non-interactive \
        -d "$DOMAIN" \
        -d "www.$DOMAIN" || {
            echo "证书获取失败，清理临时容器" >&2
            docker stop temp_nginx && docker rm temp_nginx
            exit 1
        }

    # 停止临时 nginx
    docker stop temp_nginx && docker rm temp_nginx

    # 重启 noiquest nginx（如果存在）
    docker start noiquest_nginx 2>/dev/null || echo "noiquest_nginx 容器不存在，跳过重启"

    echo '证书获取成功'
EOF_SSH

# 检查远程命令是否执行成功
if [ $? -ne 0 ]; then
    error_exit "远程服务器获取证书失败"
fi

# 下载证书到本地
echo ""
echo -e "${YELLOW}[3/4] 下载证书到本地...${NC}"
rm -rf "$LOCAL_SSL_DIR" || true
mkdir -p "$LOCAL_SSL_DIR" || error_exit "创建本地证书目录失败"
scp -r "$SERVER:$REMOTE_CERT_DIR/ssl/"* "$LOCAL_SSL_DIR/" || error_exit "证书下载失败"

# 清理服务器临时目录
echo ""
echo -e "${YELLOW}[4/4] 清理服务器临时文件...${NC}"
ssh "$SERVER" "rm -rf $REMOTE_CERT_DIR" || echo "警告：远程临时目录清理失败，请手动执行 rm -rf $REMOTE_CERT_DIR"

# 显示证书信息
echo ""
echo -e "${GREEN}==========================================="
echo -e "  证书获取完成!"
echo -e "===========================================${NC}"
echo ""
echo "证书已保存到: $LOCAL_SSL_DIR"
echo ""
if [ -d "$LOCAL_SSL_DIR/live/$DOMAIN/" ]; then
    ls -la "$LOCAL_SSL_DIR/live/$DOMAIN/"
else
    echo -e "${YELLOW}警告：未找到证书目录 $LOCAL_SSL_DIR/live/$DOMAIN/，请检查下载是否成功${NC}"
fi
echo ""
echo "证书有效期约 90 天，到期前请重新运行此脚本获取新证书"
echo ""