# 花园管理系统 (Garden Manager)

花园管理系统是一个用于管理和监控园林养护工作的综合平台，提供用户管理、问题处置、养护记录、考核统计等功能。

## 功能特点

- 用户管理：管理员账户管理、权限控制
- 个人资料：个性化设置，头像上传
- 问题处置管理：记录和跟踪园林养护问题
- 养护记录：维护历史记录的查询和统计
- 考核评估：对养护工作进行评分和统计
- 数据字典：维护基础信息和配置

## 技术栈

- **前端**：React, TypeScript, Ant Design
- **构建工具**：Create React App
- **路由**：React Router
- **部署**：Docker, NGINX

## 开发指南

### 环境要求

- Node.js (推荐 v18.x 或更高)
- npm 或 yarn

### 安装与运行

```bash
# 克隆项目
git clone <repository-url>
cd garden-manager

# 安装依赖
npm install --legacy-peer-deps

# 启动开发服务器
npm start
```

应用将在 [http://localhost:3000](http://localhost:3000) 运行。

### 测试

```bash
# 运行测试
npm test
```

### 构建

```bash
# 构建生产版本
npm run build
```

## 部署指南

本项目提供了多种部署方式，详细说明请参见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

### 部署到 www.coderhythm.cn

我们提供了专门的脚本，用于将项目部署到指定的服务器：

```bash
# 赋予部署脚本执行权限
chmod +x deploy-coderhythm.sh

# 执行一键部署脚本（提供HTTP和HTTPS两种选项）
./deploy-coderhythm.sh
```

### 传统部署

1. 构建应用

   ```bash
   npm run build
   ```

2. 执行部署脚本

   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. 将生成的`deploy`目录内容上传到 Web 服务器。

### Docker 部署

使用 Docker Compose 快速部署:

```bash
docker-compose up -d --build
```

### 云平台部署

项目支持部署到多种云平台:

- GitHub Pages
- AWS S3 + CloudFront
- Netlify
- Vercel

详见 [DEPLOYMENT.md](./DEPLOYMENT.md) 中的 CI/CD 部分。

## 文件结构

```
garden-manager/
├── public/                 # 静态资源
├── src/                    # 源代码
│   ├── pages/              # 页面组件
│   │   ├── auth/           # 认证相关页面
│   │   ├── dashboard/      # 主面板
│   │   ├── assessment/     # 评估模块
│   │   ├── inspection/     # 巡查模块
│   │   └── settings/       # 设置页面
│   ├── components/         # 通用组件
│   ├── App.tsx             # 主应用组件
│   └── index.tsx           # 入口文件
├── .env.production         # 生产环境配置
├── Dockerfile              # Docker配置
├── docker-compose.yml      # Docker Compose配置
├── nginx.conf              # Nginx配置
├── deploy.sh               # 通用部署脚本
├── deploy-coderhythm.sh    # 特定服务器部署脚本
└── DEPLOYMENT.md           # 部署详细指南
```

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 许可证

[License Type] - 详情请查看 [LICENSE](LICENSE) 文件。

## 联系方式

项目维护者 - 您的姓名/团队名称 - 您的邮箱/联系方式
