#!/bin/bash

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}检查数据库连接...${NC}"

# 检查Docker是否运行
if ! command -v docker &> /dev/null; then
    echo -e "${RED}未检测到Docker，请确保Docker已安装并启动。${NC}"
    exit 1
fi

# 检查MySQL容器是否在运行
DB_CONTAINER="garden-db-local"
if [ ! "$(docker ps -q -f name=$DB_CONTAINER)" ]; then
    echo -e "${RED}MySQL容器未运行！请先运行run-mysql-local.sh脚本${NC}"
    exit 1
fi

# 获取容器IP地址
CONTAINER_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $DB_CONTAINER)
echo -e "${BLUE}MySQL容器IP: $CONTAINER_IP${NC}"

# 检查容器内MySQL服务是否可用
echo -e "${BLUE}检查MySQL服务状态...${NC}"
if docker exec $DB_CONTAINER mysqladmin ping -h localhost -u garden_user -pgarden_password --silent; then
    echo -e "${GREEN}MySQL服务正常运行！${NC}"
else
    echo -e "${RED}MySQL服务未启动或凭据错误！${NC}"
    exit 1
fi

# 尝试连接到指定的数据库
echo -e "${BLUE}尝试连接到garden_manager数据库...${NC}"
if docker exec $DB_CONTAINER mysql -h localhost -u garden_user -pgarden_password -e "USE garden_manager; SELECT 'Connection successful!' as Status;" 2>/dev/null; then
    echo -e "${GREEN}数据库连接成功！${NC}"
else
    echo -e "${RED}无法连接到数据库！${NC}"
    exit 1
fi

# 显示数据库信息
echo -e "${BLUE}数据库信息:${NC}"
docker exec $DB_CONTAINER mysql -h localhost -u garden_user -pgarden_password -e "USE garden_manager; SHOW TABLES;" 2>/dev/null

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}数据库连接检查完成！${NC}"
echo -e "${GREEN}数据库名: garden_manager${NC}"
echo -e "${GREEN}用户名: garden_user${NC}"
echo -e "${GREEN}密码: garden_password${NC}"
echo -e "${GREEN}JDBC URL: jdbc:mysql://localhost:3306/garden_manager${NC}"
echo -e "${GREEN}================================${NC}" 