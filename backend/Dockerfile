# 第一阶段：构建应用
FROM maven:3.8-openjdk-11-slim AS build

# 设置工作目录
WORKDIR /app

# 复制pom.xml文件
COPY pom.xml .

# 下载所有依赖项，但不执行任何编译
# 如果依赖项未更改，缓存可以更好地工作
RUN mvn dependency:go-offline -B

# 复制源代码
COPY src ./src

# 构建应用
RUN mvn package -DskipTests

# 第二阶段：运行时
FROM openjdk:11-jre-slim

# 添加应用程序用户
RUN addgroup --system --gid 1001 appuser && \
    adduser --system --uid 1001 --gid 1001 --no-create-home appuser

# 设置工作目录
WORKDIR /app

# 从构建阶段复制构建结果
COPY --from=build /app/target/*.jar app.jar

# 切换到非root用户
USER appuser

# 设置健康检查
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

# 暴露端口
EXPOSE 8080

# 环境变量
ENV SPRING_PROFILES_ACTIVE=prod

# 启动命令
ENTRYPOINT ["java", "-jar", "app.jar"] 