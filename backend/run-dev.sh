#!/bin/bash

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}准备启动花园管理系统后端（开发模式）...${NC}"

# 检查是否安装了Java
if ! command -v java &> /dev/null; then
    echo -e "${YELLOW}未检测到Java，请先安装Java后再运行此脚本。${NC}"
    exit 1
fi

# 检查MySQL容器是否在运行
DB_CONTAINER="garden-db-local"
if [ ! "$(docker ps -q -f name=$DB_CONTAINER)" ]; then
    echo -e "${YELLOW}MySQL容器未运行，尝试启动...${NC}"
    # 如果容器存在但未运行，尝试启动
    if [ "$(docker ps -aq -f name=$DB_CONTAINER)" ]; then
        docker start $DB_CONTAINER
    else
        echo -e "${YELLOW}MySQL容器不存在，请先运行run-mysql-local.sh脚本${NC}"
        exit 1
    fi
    # 等待MySQL启动
    echo -e "${BLUE}等待MySQL启动...${NC}"
    sleep 5
fi

# 重点提示
echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}重要提示:${NC}"
echo -e "${YELLOW}1. 正在使用本地Docker MySQL数据库${NC}"
echo -e "${YELLOW}2. 应用将在开发模式下运行${NC}"
echo -e "${YELLOW}3. API将在 http://localhost:8080/api 可用${NC}"
echo -e "${YELLOW}================================${NC}"

# 切换到后端目录（如果脚本不在后端目录）
cd "$(dirname "$0")"

# 设置开发环境变量并启动应用
echo -e "${GREEN}使用开发配置启动Spring Boot应用...${NC}"
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run 