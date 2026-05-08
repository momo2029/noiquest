# NOI Quest 生产环境部署指南

## 🚀 快速开始

### 1. 初始部署

```bash
cd /opt/noiquest/deploy
./update-deploy.sh
```

### 2. 手动部署步骤

```bash
# 上传代码和配置
rsync -avz --exclude 'node_modules' --exclude '.git' \
    /path/to/local/project/ root@45.78.235.129:/opt/noiquest/

# 复制环境变量
scp backend/.env.production root@45.78.235.129:/opt/noiquest/deploy/.env

# 构建并启动服务
docker-compose up -d --build

# 复制前端文件到Nginx
docker cp noiquest_frontend:/usr/share/nginx/html/. /usr/share/nginx/html/noiquest/

# 配置Nginx
cp noiquest-nginx.conf /etc/nginx/sites-available/noiquest.conf
ln -sf /etc/nginx/sites-available/noiquest.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## 📊 服务架构

```
+------------------+       +-------------------+       +------------------+
|                  |       |                   |       |                  |
|   客户端 (HTTPS) | ----> |   Nginx (443)     | ----> |  React 前端      |
|                  |       |                   |       |                  |
+------------------+       +-------------------+       +------------------+
                                    |
                                    v
                           +-------------------+
                           |                   |
                           |  Node.js 后端     |
                           |  (端口 3001)      |
                           |                   |
                           +-------------------+
                                    |
                                    v
                           +-------------------+
                           |                   |
                           | PostgreSQL        |
                           |  47.80.18.138:8899|
                           |                   |
                           +-------------------+
```

## 🔧 配置文件说明

### .env 环境变量
```env
# 数据库配置
DATABASE_URL=postgresql://noiquest_user:5vB7sK2pG9dR4mQ6zW8@47.80.18.138:8899/noiquest_db?schema=public&sslmode=require

# JWT 配置
JWT_SECRET=n78349817234*#@¥7234
JWT_EXPIRES_IN=7d

# API 配置
PORT=3001
NODE_ENV=production

# CORS 配置
CORS_ORIGIN=https://noiquest.com,https://www.noiquest.com
```

### docker-compose.yml 服务说明
- **backend**: Node.js Express 应用，端口 3001
- **frontend**: Nginx 静态文件服务，端口 8080
- **monitor**: 可选监控容器（每5分钟检查一次）

## 🛡️ 安全配置

### SSL/TLS
- Let's Encrypt 自动续期证书
- TLS 1.2/1.3 协议
- HSTS 强制HTTPS
- 安全头部配置

### 防火墙规则
```bash
# 开放必要端口
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3001/tcp  # API (内部使用)
ufw enable
```

### 访问控制
- 仅限API路径需要认证
- Nginx配置防止目录遍历
- 请求速率限制

## 📈 性能优化

### Nginx 缓存
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 压缩配置
- Gzip/Brotli 压缩
- 静态资源长期缓存
- 动态内容即时生成

## 🔍 监控告警

### 健康检查端点
- `GET /health` - Nginx状态
- `GET /api/health` - 后端状态
- `GET /` - 前端页面

### 日志管理
- Nginx访问日志：`/var/log/nginx/access.log`
- Nginx错误日志：`/var/log/nginx/error.log`
- 后端日志：`docker-compose logs backend`

### 磁盘空间监控
```bash
# 定期检查
df -h /
find /var/log -name "*.log" -size +100M -delete
```

## 🚨 故障排除

### 常见问题

#### 1. 502 Bad Gateway
```bash
# 检查后端服务
docker-compose ps
curl http://localhost:3001/health

# 查看日志
docker-compose logs backend
```

#### 2. SSL证书问题
```bash
# 重新申请证书
certbot renew --force-renewal

# 测试配置
nginx -t
systemctl reload nginx
```

#### 3. 数据库连接失败
```bash
# 检查数据库服务器
ping 47.80.18.138
telnet 47.80.18.138 8899

# 检查环境变量
cat .env | grep DATABASE
```

### 紧急恢复

```bash
# 停止所有服务
docker-compose down

# 清理旧镜像
docker image prune -a

# 重新部署
./update-deploy.sh
```

## 📞 联系信息

- **技术支持**: admin@noiquest.com
- **紧急联系**: +86 138-XXXX-XXXX
- **文档更新**: https://github.com/your-org/noiquest

---

**最后更新**: 2026-05-08
**版本**: v1.0.0