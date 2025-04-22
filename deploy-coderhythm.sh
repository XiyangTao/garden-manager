# 在文件上传后添加目录验证
ssh ${SERVER_USER}@${SERVER_IP} "
    mkdir -p /opt/garden-backend/uploads/avatars
    chmod 755 /opt/garden-backend/uploads/avatars
    ls -ld /opt/garden-backend/uploads/avatars
" 