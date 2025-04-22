#!/bin/bash
set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 服务器配置
SERVER_IP="47.117.44.12"
SERVER_USER="root"
DOMAIN="www.coderhythm.cn"
DEPLOY_PATH="/var/www/garden-manager"
NGINX_CONF_PATH="/etc/nginx/sites-available/garden-manager"
BACKEND_PORT="8080"

# 显示标题
echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}         花园管理系统部署脚本 (v2.1)                 ${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo -e "${YELLOW}目标服务器: ${SERVER_IP} (${DOMAIN})${NC}"
echo ""

# 检查依赖
MISSING_DEPS=0
for cmd in rsync ssh scp; do
    if ! command -v $cmd &> /dev/null; then
        echo -e "${RED}错误: 缺少必要的命令: ${cmd}${NC}"
        MISSING_DEPS=1
    fi
done

if [ $MISSING_DEPS -eq 1 ]; then
    echo -e "${RED}请安装缺少的依赖后重试${NC}"
    exit 1
fi

# 选择部署模式
echo -e "${YELLOW}请选择操作模式:${NC}"
echo -e "  ${GREEN}1) 全量部署-HTTP${NC}   - 完整流程（配置Nginx）"
echo -e "  ${GREEN}2) 全量部署-HTTPS${NC}  - 完整流程（配置SSL）"
echo -e "  ${GREEN}3) 仅构建上传${NC}     - 到文件上传即结束"
read -p "请输入选项 [1-3]: " deploy_mode

if [[ ! "$deploy_mode" =~ ^[1-3]$ ]]; then
    echo -e "${RED}错误：无效的选项，请输入1、2或3${NC}"
    exit 1
fi

echo -e "${YELLOW}开始部署流程...${NC}"

# 步骤1: 安装前端依赖
echo -e "${GREEN}[1/4] 安装前端依赖...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}   清理现有依赖...${NC}"
    sudo rm -rf node_modules
fi
rm -f package-lock.json
npm install --legacy-peer-deps

# 步骤2: 构建前端
echo -e "${GREEN}[2/4] 构建前端项目...${NC}"
npm run build

# 步骤3: 准备部署目录
echo -e "${GREEN}[3/4] 创建部署目录...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${DEPLOY_PATH}"

# 步骤4: 上传构建文件
echo -e "${GREEN}[4/4] 上传前端文件...${NC}"
rsync -avz --delete build/ ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/

# 在步骤4之后立即判断模式
if [ "$deploy_mode" -eq 3 ]; then
    echo -e "${BLUE}=====================================================${NC}"
    echo -e "${GREEN}✅ 文件上传成功！${NC}"
    echo -e "${YELLOW}┌──────────────────────────────┐"
    echo -e "│        上传完成报告         │"
    echo -e "├──────────────┬─────────────┤"
    echo -e "│ 文件数量     │ $(ssh ${SERVER_USER}@${SERVER_IP} "find ${DEPLOY_PATH} -type f | wc -l") 个"
    echo -e "│ 最后修改时间 │ $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "│ 部署路径     │ ${DEPLOY_PATH}"
    echo -e "└──────────────┴─────────────┘${NC}"
    echo -e "${YELLOW}验证命令："
    echo -e "ssh ${SERVER_USER}@${SERVER_IP} \"ls -lht ${DEPLOY_PATH} | head -n 5\"${NC}"
    echo -e "${BLUE}=====================================================${NC}"

    exit 0
fi

# 公共Nginx配置
BASE_NGINX_CONFIG="
    # API代理配置
    location /api {
        proxy_pass http://localhost:${BACKEND_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 7d;
        add_header Cache-Control \"public, max-age=604800\";
    }

    # React路由处理
    location / {
        try_files \$uri \$uri/ /index.html;
    }
"

if [ "$deploy_mode" == "1" ]; then
    # HTTP模式配置
    echo -e "${GREEN}5. 配置Nginx (HTTP)...${NC}"
    cat > nginx.site.conf << EOL
server {
    listen 80;
    server_name ${DOMAIN};

    root ${DEPLOY_PATH};
    index index.html;

    # 安全头
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    ${BASE_NGINX_CONFIG}
}
EOL

    # 应用配置
    echo -e "${GREEN}6. 上传并应用Nginx配置...${NC}"
    scp nginx.site.conf ${SERVER_USER}@${SERVER_IP}:${NGINX_CONF_PATH}
    ssh ${SERVER_USER}@${SERVER_IP} "
        ln -sf ${NGINX_CONF_PATH} /etc/nginx/sites-enabled/
        nginx -t && systemctl restart nginx
        chown -R www-data:www-data ${DEPLOY_PATH}
        echo 'HTTP部署完成'
    "

    rm -f nginx.site.conf
    echo -e "${GREEN}✅ HTTP部署完成! 访问: http://${DOMAIN}${NC}"

else
    # HTTPS模式配置
    echo -e "${GREEN}5. 配置HTTPS...${NC}"
    cat > nginx.site.conf << EOL
server {
    listen 80;
    server_name ${DOMAIN};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    # SSL优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    root ${DEPLOY_PATH};
    index index.html;

    ${BASE_NGINX_CONFIG}
}
EOL

    # 上传并配置
    echo -e "${GREEN}6. 应用HTTPS配置...${NC}"
    scp nginx.site.conf ${SERVER_USER}@${SERVER_IP}:${NGINX_CONF_PATH}
    ssh ${SERVER_USER}@${SERVER_IP} "
        # 验证证书文件是否存在
        if [ ! -f /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ] || [ ! -f /etc/letsencrypt/live/${DOMAIN}/privkey.pem ]; then
            echo -e '${RED}错误：找不到SSL证书文件${NC}'
            echo -e '${YELLOW}请确认证书路径：/etc/letsencrypt/live/${DOMAIN}/'
            exit 1
        fi

        # 创建配置链接
        ln -sf ${NGINX_CONF_PATH} /etc/nginx/sites-enabled/
        
        # 测试并重启Nginx
        nginx -t && systemctl restart nginx
        
        # 设置目录权限
        chown -R www-data:www-data ${DEPLOY_PATH}
        
        echo 'HTTPS配置已更新'
    "

    rm -f nginx.site.conf
    echo -e "${GREEN}✅ HTTPS配置更新完成! 访问: https://${DOMAIN}${NC}"

    # 验证证书信息
    echo -e "${GREEN}7. 验证证书信息...${NC}"
    ssh ${SERVER_USER}@${SERVER_IP} "
        echo -e '${YELLOW}证书有效期：${NC}'
        openssl x509 -in /etc/letsencrypt/live/${DOMAIN}/fullchain.pem -noout -dates
        echo -e '\n${YELLOW}证书颁发机构：${NC}'
        openssl x509 -in /etc/letsencrypt/live/${DOMAIN}/fullchain.pem -noout -issuer
    "
fi

# 验证部署
echo -e "${GREEN}7. 执行部署验证...${NC}"
echo -e "${YELLOW}前端访问测试: curl -I http://${DOMAIN}"
echo -e "API接口测试: curl http://${DOMAIN}/api/healthcheck${NC}"

echo -e "${BLUE}=====================================================${NC}"
echo -e "${GREEN}全量部署完成!${NC}"
echo -e "${BLUE}=====================================================${NC}"
exit 0 