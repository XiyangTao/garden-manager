# 花园管理系统 - Docker 部署指南

这个文档提供了如何使用 Docker 将花园管理系统打包并部署的详细说明。

## 项目结构

项目采用前后端分离的架构，Docker 文件分别放置在各自工程目录下：

```
garden-manager/                 # 项目根目录
├── docker-compose.yml          # 根目录下的Docker Compose配置
├── garden-manager/             # 前端工程目录
│   ├── Dockerfile              # 前端Docker构建文件
│   ├── nginx.conf              # Nginx配置
│   ├── docker-entrypoint.sh    # 前端容器启动脚本
│   └── ...                     # 其他前端代码
└── backend/                    # 后端工程目录
    ├── Dockerfile              # 后端Docker构建文件
    └── ...                     # 其他后端代码
```

## Docker 构建和部署

### 前端和后端分别构建

如果需要单独构建前端或后端：

```bash
# 构建前端
cd garden-manager
docker build -t garden-manager-frontend:latest .

# 构建后端
cd backend
docker build -t garden-manager-backend:latest .
```

### 使用 Docker Compose 构建和部署整个应用

推荐使用 Docker Compose 从项目根目录一键部署整个应用：

```bash
# 构建并启动所有服务
docker-compose up -d

# 只重新构建并启动前端
docker-compose up -d --build frontend

# 只重新构建并启动后端
docker-compose up -d --build backend
```

## 配置说明

### 前端配置

前端使用 Nginx 作为 Web 服务器，通过环境变量可以自定义 API 接口地址：

```bash
docker run -d -p 80:80 \
  -e BACKEND_URL=http://your-backend-server:8080 \
  -e API_URL=/custom-api \
  --name garden-frontend \
  garden-manager-frontend:latest
```

#### 可用的环境变量

| 变量名        | 默认值                        | 说明                      |
| ------------- | ----------------------------- | ------------------------- |
| `API_URL`     | `/api`                        | 前端代码中 API 的基础路径 |
| `BACKEND_URL` | `http://backend-service:8080` | 后端服务的 URL            |

### 后端配置

后端是 Java Spring Boot 应用，支持以下环境变量：

```bash
docker run -d -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://your-db-server:3306/garden_manager \
  -e SPRING_DATASOURCE_USERNAME=garden_user \
  -e SPRING_DATASOURCE_PASSWORD=secure_password \
  --name garden-backend \
  garden-manager-backend:latest
```

#### 可用的环境变量

| 变量名                       | 默认值 | 说明                               |
| ---------------------------- | ------ | ---------------------------------- |
| `SPRING_PROFILES_ACTIVE`     | `prod` | Spring Boot 激活的配置文件         |
| `SPRING_DATASOURCE_URL`      | (无)   | 数据库连接 URL                     |
| `SPRING_DATASOURCE_USERNAME` | (无)   | 数据库用户名                       |
| `SPRING_DATASOURCE_PASSWORD` | (无)   | 数据库密码                         |
| `APP_BASE_URL`               | (无)   | 应用基础 URL，用于生成完整资源链接 |

## 工作原理

### 前端与后端交互

1. 前端构建时，已将 API URL 配置为相对路径`/api`
2. Nginx 配置了`/api`路径的代理，将请求转发到后端服务
3. 通过环境变量可以在容器启动时动态修改这些设置

### 数据持久化

MySQL 数据通过 Docker 卷进行持久化存储：

```yaml
volumes:
  db-data:
```

## 生产环境部署建议

1. 始终为生产环境配置 HTTPS
2. 使用 Docker Swarm 或 Kubernetes 进行容器编排
3. 实现健康检查和自动重启
4. 设置适当的日志轮转
5. 使用 Docker Secrets 管理敏感信息
6. 定期备份数据库卷

## 故障排除

### 常见问题

1. **前端无法连接后端**

   - 检查`BACKEND_URL`环境变量是否正确
   - 确保后端服务正常运行
   - 确认网络通信正常

2. **后端无法连接数据库**
   - 检查数据库连接字符串和凭据
   - 确保数据库容器正常运行
   - 检查网络连接

### 查看日志

```bash
# 查看前端日志
docker logs garden-manager-frontend

# 查看后端日志
docker logs garden-manager-backend

# 查看数据库日志
docker logs garden-manager-db
```

## 参考资料

- [Docker 文档](https://docs.docker.com/)
- [Nginx 文档](https://nginx.org/en/docs/)
- [Spring Boot Docker 指南](https://spring.io/guides/topicals/spring-boot-docker/)
