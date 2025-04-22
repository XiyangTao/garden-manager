# 花园管理系统 - 开发环境设置

本文档介绍如何在本地设置花园管理系统的开发环境，使用 Docker 容器作为数据库，本地运行前端和后端服务。

## 开发环境架构

```
[本地前端应用] <-> [本地后端应用] <-> [Docker MySQL数据库]
```

## 快速开始

使用一键启动脚本启动整个开发环境：

```bash
./start-dev-env.sh
```

此脚本会：

1. 启动 MySQL Docker 容器
2. 验证数据库连接
3. 提供选项启动后端和/或前端服务

## 手动启动各组件

### 1. 启动 MySQL 数据库

使用以下命令启动本地 MySQL 数据库容器：

```bash
./run-mysql-local.sh
```

或使用 Docker Compose：

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. 验证数据库连接

确认数据库连接是否正常：

```bash
./backend/check-db-connection.sh
```

### 3. 启动后端服务

以开发模式启动后端服务，连接到本地 MySQL：

```bash
./backend/run-dev.sh
```

后端服务将在 http://localhost:8080/api 上可用。

### 4. 启动前端服务

启动 React 开发服务器：

```bash
cd garden-manager
npm start
```

前端应用将在 http://localhost:3000 上可用。

## 配置说明

### 数据库配置

本地 MySQL 配置：

- 数据库名：garden_manager
- 用户名：garden_user
- 密码：garden_password
- 端口：3306
- JDBC URL：jdbc:mysql://localhost:3306/garden_manager

这些配置在以下文件中定义：

- `docker-compose.dev.yml`
- `backend/src/main/resources/application-dev.properties`

### 后端配置

开发环境的 Spring Boot 配置位于：

- `backend/src/main/resources/application-dev.properties`

主要特点：

- 连接到本地 MySQL
- 启用详细日志
- 自动更新数据库模式 (hibernate.ddl-auto=update)
- 支持跨域请求

### 前端配置

前端在开发模式下会使用 `.env` 文件，配置 API 地址为 http://localhost:8080/api。

## 故障排除

### 数据库连接问题

如果后端无法连接到数据库：

1. 确认 MySQL 容器是否在运行：`docker ps | grep garden-db-local`
2. 检查数据库连接：`./backend/check-db-connection.sh`
3. 验证应用程序配置：检查 `application-dev.properties` 中的连接信息

### 后端启动问题

如果后端无法启动：

1. 检查 Java 是否已安装：`java -version`
2. 确认 Maven 包装器是否有执行权限：`chmod +x ./backend/mvnw`
3. 检查日志中的错误消息

### 前端启动问题

如果前端无法启动：

1. 确认 Node.js 是否已安装：`node -v`
2. 尝试重新安装依赖：`cd garden-manager && npm install`
3. 检查 API 请求是否能正确发送到后端

## 开发工作流

1. 使用 `start-dev-env.sh` 启动开发环境
2. 修改后端代码（Java）后，服务器将自动重启
3. 修改前端代码（React）后，应用将自动刷新
4. 数据库更改会持久保存在 Docker 卷中
5. 如需重置数据库，可以删除 Docker 卷：`docker volume rm garden-db-local-data`
