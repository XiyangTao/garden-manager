# 阶段1: 构建React应用
FROM node:20-alpine as build

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --quiet

# 复制源代码
COPY src ./src
COPY public ./public
COPY tsconfig.json ./
COPY .env.production ./

# 构建应用
RUN npm run build

# 阶段2: 设置Nginx服务
FROM nginx:1.25.3-alpine

# 复制构建产物到Nginx服务目录
COPY --from=build /app/build /usr/share/nginx/html

# 复制自定义Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 创建一个健康检查文件
RUN echo "healthy" > /usr/share/nginx/html/health.txt

# nginx容器默认在80端口
EXPOSE 80


# 设置环境变量默认值
ENV API_URL=/api

# 启动Nginx服务
CMD ["nginx", "-g", "daemon off;"] 