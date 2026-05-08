#!/bin/bash

# NOI Quest 监控脚本
# 用于定期检查服务状态和性能指标

set -e

LOG_FILE="/var/log/noiquest-monitor.log"
SERVER="root@45.78.235.129"

echo "[$(date)] Starting NOI Quest monitoring..." >> "$LOG_FILE"

# 检查后端API健康状态
check_backend() {
    echo "[$(date)] Checking backend health..." >> "$LOG_FILE"
    if curl -s --max-time 10 http://localhost:3001/health > /dev/null; then
        echo "[$(date)] Backend is healthy" >> "$LOG_FILE"
        return 0
    else
        echo "[$(date)] ERROR: Backend is unhealthy!" >> "$LOG_FILE"
        return 1
    fi
}

# 检查数据库连接
check_database() {
    echo "[$(date)] Checking database connection..." >> "$LOG_FILE"
    if docker exec noiquest_backend npx prisma db pull > /dev/null 2>&1; then
        echo "[$(date)] Database connection OK" >> "$LOG_FILE"
        return 0
    else
        echo "[$(date)] ERROR: Database connection failed!" >> "$LOG_FILE"
        return 1
    fi
}

# 检查Nginx状态
check_nginx() {
    echo "[$(date)] Checking Nginx status..." >> "$LOG_FILE"
    if systemctl is-active --quiet nginx; then
        if nginx -t > /dev/null 2>&1; then
            echo "[$(date)] Nginx is running and configuration is valid" >> "$LOG_FILE"
            return 0
        else
            echo "[$(date)] ERROR: Nginx configuration is invalid!" >> "$LOG_FILE"
            return 1
        fi
    else
        echo "[$(date)] ERROR: Nginx is not running!" >> "$LOG_FILE"
        return 1
    fi
}

# 检查容器状态
check_containers() {
    echo "[$(date)] Checking Docker containers..." >> "$LOG_FILE"
    cd /opt/noiquest/deploy
    if docker-compose ps | grep -q "Up"; then
        echo "[$(date)] All containers are running" >> "$LOG_FILE"
        return 0
    else
        echo "[$(date)] ERROR: Some containers are down!" >> "$LOG_FILE"
        return 1
    fi
}

# 检查磁盘空间
check_disk_space() {
    echo "[$(date)] Checking disk space..." >> "$LOG_FILE"
    local usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$usage" -gt 90 ]; then
        echo "[$(date)] WARNING: Disk usage is ${usage}%" >> "$LOG_FILE"
    else
        echo "[$(date)] Disk usage is ${usage}% (OK)" >> "$LOG_FILE"
    fi
}

# 检查内存使用
check_memory() {
    echo "[$(date)] Checking memory usage..." >> "$LOG_FILE"
    local mem_usage=$(free | grep Mem | awk '{printf("%.1f", ($3/$2) * 100.0)}')
    if (( $(echo "$mem_usage > 90" | bc -l) )); then
        echo "[$(date)] WARNING: Memory usage is ${mem_usage}%" >> "$LOG_FILE"
    else
        echo "[$(date)] Memory usage is ${mem_usage}% (OK)" >> "$LOG_FILE"
    fi
}

# 主监控逻辑
main() {
    local errors=0

    check_backend || ((errors++))
    check_database || ((errors++))
    check_nginx || ((errors++))
    check_containers || ((errors++))
    check_disk_space
    check_memory

    if [ "$errors" -eq 0 ]; then
        echo "[$(date)] All checks passed successfully" >> "$LOG_FILE"
    else
        echo "[$(date)] ERROR: $errors check(s) failed" >> "$LOG_FILE"
        # 发送告警（可以集成邮件、Slack等）
    fi

    echo "[$(date)] Monitoring completed" >> "$LOG_FILE"
}

# 执行监控
main