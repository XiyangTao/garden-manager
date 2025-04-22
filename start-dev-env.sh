#!/bin/bash

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}启动花园管理系统开发环境...${NC}"

# 检查Docker是否运行
if ! command -v docker &> /dev/null; then
    echo -e "${RED}未检测到Docker，请确保Docker已安装并启动。${NC}"
    exit 1
fi

# 启动MySQL数据库
echo -e "${BLUE}启动MySQL数据库...${NC}"
docker-compose -f docker-compose.dev.yml up -d

# 等待MySQL启动
echo -e "${BLUE}等待MySQL启动...${NC}"
sleep 5

# 检查数据库连接
./backend/check-db-connection.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}数据库连接失败，无法继续！${NC}"
    exit 1
fi

# 提示用户选择操作
echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}数据库已成功启动！下一步操作:${NC}"
echo -e "${YELLOW}1) 启动后端服务 (java)${NC}"
echo -e "${YELLOW}2) 启动前端服务 (react)${NC}"
echo -e "${YELLOW}3) 启动全部服务${NC}"
echo -e "${YELLOW}4) 退出${NC}"
echo -e "${YELLOW}================================${NC}"

read -p "请选择操作 [1-4]: " choice

case $choice in
    1)
        echo -e "${GREEN}启动后端服务...${NC}"
        ./backend/run-dev.sh
        ;;
    2)
        echo -e "${GREEN}启动前端服务...${NC}"
        cd garden-manager && npm start
        ;;
    3)
        echo -e "${GREEN}启动全部服务...${NC}"
        echo -e "${BLUE}启动后端服务 (在新终端窗口)...${NC}"
        osascript -e 'tell application "Terminal" to do script "cd '$(pwd)' && ./backend/run-dev.sh"'
        
        echo -e "${BLUE}启动前端服务...${NC}"
        cd garden-manager && npm start
        ;;
    *)
        echo -e "${BLUE}数据库已启动，可以使用以下命令单独启动服务:${NC}"
        echo -e "${BLUE}- 后端: ./backend/run-dev.sh${NC}"
        echo -e "${BLUE}- 前端: cd garden-manager && npm start${NC}"
        ;;
esac

echo -e "${GREEN}开发环境准备就绪！${NC}" 