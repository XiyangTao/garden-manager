-- 创建数据库
CREATE DATABASE IF NOT EXISTS garden_manager 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER IF NOT EXISTS 'garden_user'@'localhost' 
IDENTIFIED BY 'garden_password';

-- 授权
GRANT ALL PRIVILEGES ON garden_manager.* 
TO 'garden_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 使用数据库
USE garden_manager;
