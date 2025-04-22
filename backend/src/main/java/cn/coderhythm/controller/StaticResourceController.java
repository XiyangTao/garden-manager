package cn.coderhythm.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 静态资源控制器，提供不需要API前缀的资源访问
 * 特别是用于前端直接访问头像等静态资源
 */
@Controller
@RequestMapping("")  // 根路径，不使用API前缀
public class StaticResourceController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    /**
     * 提供头像图片访问
     * 注意：这个路径是直接从根访问，不需要/api前缀
     * 比如: http://localhost:8080/avatars/{filename}
     */
    @GetMapping("/avatars/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveAvatarFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve("avatars").resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                // 确定内容类型
                String contentType = null;
                if (filename.toLowerCase().endsWith(".png")) {
                    contentType = MediaType.IMAGE_PNG_VALUE;
                } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                    contentType = MediaType.IMAGE_JPEG_VALUE;
                } else {
                    contentType = "application/octet-stream";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 