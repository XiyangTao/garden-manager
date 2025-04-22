#!/bin/bash
set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 服务器配置
SERVER_IP="47.117.44.12"
SERVER_USER="root"
DEPLOY_DIR="/opt/garden-backend"
SERVICE_NAME="garden-backend"
DB_NAME="garden_manager"
DB_USER="garden_user"
DB_PASS="garden_password"

# 显示部署信息
echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}       花园管理系统后端部署脚本           ${NC}"
echo -e "${BLUE}===========================================${NC}"
echo -e "${YELLOW}服务器: ${SERVER_IP}"
echo -e "部署目录: ${DEPLOY_DIR}"
echo -e "服务名称: ${SERVICE_NAME}${NC}"
echo ""

# 检查本地构建环境
echo -e "${GREEN}[1/6] 检查本地环境...${NC}"
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}错误：本地需要安装Maven${NC}"
    exit 1
fi

# 构建项目
echo -e "${GREEN}[2/6] 构建项目...${NC}"
mvn clean package -DskipTests

# 准备部署文件
echo -e "${GREEN}[3/6] 准备部署文件...${NC}"
JAR_FILE=$(find target -name "*.jar" | head -n 1)
if [ -z "$JAR_FILE" ]; then
    echo -e "${RED}错误：未找到可部署的JAR文件${NC}"
    exit 1
fi

TMP_DIR="tmp_deploy"
mkdir -p $TMP_DIR/bin $TMP_DIR/config

# 分别复制文件
cp $JAR_FILE $TMP_DIR/bin/
cp src/main/resources/application*.properties $TMP_DIR/config/ 2>/dev/null || true

# 分别上传
rsync -avz $TMP_DIR/bin/ ${SERVER_USER}@${SERVER_IP}:${DEPLOY_DIR}/bin/
rsync -avz $TMP_DIR/config/ ${SERVER_USER}@${SERVER_IP}:${DEPLOY_DIR}/config/

# 在上传后添加验证步骤
echo -e "${GREEN}[4.1/6] 验证文件位置...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "
    if [ ! -f ${DEPLOY_DIR}/bin/$(basename $JAR_FILE) ]; then
        echo -e '${RED}错误：JAR文件未正确部署${NC}'
        exit 1
    fi
    if [ ! -f ${DEPLOY_DIR}/config/application-prod.properties ]; then
        echo -e '${RED}错误：配置文件未正确部署${NC}'
        exit 1
    fi
"

# 配置服务
echo -e "${GREEN}[6/6] 配置系统服务...${NC}"
echo -e "${GREEN}[6/6.1] 验证配置文件...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "
    if [ ! -f ${DEPLOY_DIR}/config/application-prod.properties ]; then
        echo -e '${RED}错误：缺少生产环境配置文件${NC}'
        exit 1
    fi
    
"

ssh ${SERVER_USER}@${SERVER_IP} "
cat > /etc/systemd/system/${SERVICE_NAME}.service << EOL
[Unit]
Description=Garden Management Backend Service
After=network.target

[Service]
User=root
WorkingDirectory=${DEPLOY_DIR}/bin
ExecStart=/usr/bin/java -jar ${DEPLOY_DIR}/bin/$(basename $JAR_FILE) \\
    --spring.profiles.active=prod \\
    --spring.config.location=file:${DEPLOY_DIR}/config/ \\
    --logging.file.path=${DEPLOY_DIR}/logs 

SuccessExitStatus=143
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOL

systemctl daemon-reload
systemctl enable ${SERVICE_NAME}
systemctl restart ${SERVICE_NAME}
"

# 清理临时文件
rm -rf $TMP_DIR

echo -e "${BLUE}===========================================${NC}"
echo -e "${GREEN}✅ 后端部署完成！${NC}"
echo -e "${YELLOW}服务状态检查："
echo -e "ssh ${SERVER_USER}@${SERVER_IP} \"systemctl status ${SERVICE_NAME}\""
echo -e "实时日志查看："
echo -e "ssh ${SERVER_USER}@${SERVER_IP} \"journalctl -u ${SERVICE_NAME} -f\"${NC}"
echo -e "${BLUE}===========================================${NC}" 


