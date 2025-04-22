#!/bin/bash

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}开始编译花园管理系统后端...${NC}"

# 设置UTF-8环境变量
export JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8"
export MAVEN_OPTS="-Dfile.encoding=UTF-8"

# 切换到后端目录
cd "$(dirname "$0")"

# 清理并打包
echo -e "${BLUE}使用UTF-8编码清理并打包项目...${NC}"
./mvnw clean package -Dfile.encoding=UTF-8

# 检查是否成功
if [ $? -eq 0 ]; then
    echo -e "${GREEN}编译成功!${NC}"
    echo -e "${GREEN}JAR文件位置: $(pwd)/target/garden-manager-backend-*.jar${NC}"
else
    echo -e "${RED}编译失败!${NC}"
    exit 1
fi 