#!/bin/bash

# 设置容器名称和数据库信息
CONTAINER_NAME="garden-db-local"
DB_NAME="garden_manager"
DB_USER="garden_user"
DB_PASSWORD="garden_password"
DB_ROOT_PASSWORD="root_password"
DB_PORT=3306

# 检查容器是否已存在
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "容器 $CONTAINER_NAME 已存在，尝试启动..."
    if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
        echo "容器 $CONTAINER_NAME 已经在运行中"
    else
        docker start $CONTAINER_NAME
        echo "容器 $CONTAINER_NAME 已启动"
    fi
else
    echo "创建并启动 MySQL 容器..."
    docker run -d \
        --name $CONTAINER_NAME \
        -p $DB_PORT:3306 \
        -e MYSQL_DATABASE=$DB_NAME \
        -e MYSQL_USER=$DB_USER \
        -e MYSQL_PASSWORD=$DB_PASSWORD \
        -e MYSQL_ROOT_PASSWORD=$DB_ROOT_PASSWORD \
        -v garden-db-data:/var/lib/mysql \
        mysql:8.0 \
        --character-set-server=utf8mb4 \
        --collation-server=utf8mb4_unicode_ci

    echo "容器 $CONTAINER_NAME 已创建并启动"
fi

# 输出连接信息
echo "========================================="
echo "MySQL 数据库已准备就绪！"
echo "连接信息:"
echo "主机: localhost"
echo "端口: $DB_PORT"
echo "数据库: $DB_NAME"
echo "用户名: $DB_USER"
echo "密码: $DB_PASSWORD"
echo "========================================="
echo "JDBC URL: jdbc:mysql://localhost:$DB_PORT/$DB_NAME"
echo "========================================="
echo "要查看日志，请运行: docker logs -f $CONTAINER_NAME"
echo "要停止容器，请运行: docker stop $CONTAINER_NAME" 