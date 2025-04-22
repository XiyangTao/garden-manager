package cn.coderhythm.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    /**
     * 初始化上传目录
     */
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir, "avatars");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    /**
     * 保存Base64编码的图片
     * @param base64Image Base64编码的图片数据
     * @param userId 用户ID
     * @return 保存后的图片URL
     */
    public String saveBase64Image(String base64Image, Long userId) throws IOException {
        // 确保上传目录存在
        init();
        
        // 检查Base64字符串是否有效
        if (base64Image == null || base64Image.isEmpty()) {
            return null;
        }
        
        // 处理可能的Data URL格式 (如 "data:image/jpeg;base64,...")
        String base64Data = base64Image;
        String fileExtension = ".jpg"; // 默认扩展名
        
        if (base64Image.contains(",")) {
            String[] parts = base64Image.split(",");
            base64Data = parts[1];
            
            // 尝试从Data URL中获取文件类型
            if (parts[0].contains("image/png")) {
                fileExtension = ".png";
            } else if (parts[0].contains("image/jpeg") || parts[0].contains("image/jpg")) {
                fileExtension = ".jpg";
            }
        }
        
        // 生成唯一文件名
        String fileName = "avatar_" + userId + "_" + UUID.randomUUID().toString() + fileExtension;
        
        // 保存路径
        Path avatarPath = Paths.get(uploadDir, "avatars", fileName);
        
        // 解码Base64并保存文件
        try (FileOutputStream fos = new FileOutputStream(avatarPath.toFile())) {
            byte[] decodedImage = Base64.getDecoder().decode(base64Data);
            fos.write(decodedImage);
        }
        
        // 返回相对路径，用于数据库存储和URL访问
        return "avatars/" + fileName;
    }
    
    /**
     * 删除旧头像文件
     * @param oldAvatarPath 旧头像路径
     */
    public void deleteOldAvatar(String oldAvatarPath) {
        if (oldAvatarPath != null && !oldAvatarPath.isEmpty()) {
            try {
                Path fullPath = Paths.get(uploadDir, oldAvatarPath);
                File file = fullPath.toFile();
                
                if (file.exists() && file.isFile()) {
                    file.delete();
                }
            } catch (Exception e) {
                // 记录错误但不中断流程
                System.err.println("无法删除旧头像文件: " + e.getMessage());
            }
        }
    }
} 