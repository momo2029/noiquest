#!/bin/bash
set -e

cd /opt/noiquest

docker compose pull

if docker ps --format '{{.Names}}' | grep -q "noiquest-blue"; then
  NEW="green"
  OLD="blue"
  NEW_PORT=3202
  OLD_PORT=3201
else
  NEW="blue"
  OLD="green"
  NEW_PORT=3201
  OLD_PORT=3202
fi

echo "部署 noiquest-$NEW (端口 $NEW_PORT), 停止 noiquest-$OLD (端口 $OLD_PORT)"

docker compose up -d "noiquest-$NEW"

echo "等待健康检查..."
for i in $(seq 1 20); do
  sleep 3
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "noiquest-$NEW" 2>/dev/null || echo "starting")
  echo "  检查 $i/20: $STATUS"
  if [ "$STATUS" = "healthy" ]; then
    break
  fi
done

if docker inspect --format='{{.State.Health.Status}}' "noiquest-$NEW" 2>/dev/null | grep -q "healthy"; then
  echo "新容器健康，切换 nginx"

  sed -i "s/127.0.0.1:$OLD_PORT/127.0.0.1:$NEW_PORT/g" /etc/nginx/conf.d/noiquest.conf
  nginx -t && nginx -s reload

  echo "停止旧容器"
  docker compose stop "noiquest-$OLD"
else
  echo "新容器不健康，回滚"
  docker compose stop "noiquest-$NEW"
  exit 1
fi

docker image prune -f

echo "部署完成！当前活跃: noiquest-$NEW"
