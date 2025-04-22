package cn.coderhythm.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 映射上传目录为静态资源路径
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath.toString() + "/");
                
        registry.addResourceHandler("/avatars/**")
                .addResourceLocations("file:" + uploadPath.toString() + "/avatars/");
        
        // 添加不需要上下文路径的资源映射（解决无法直接通过 http://localhost:8080/avatars/ 访问的问题）
        registry.addResourceHandler("/resources/avatars/**")
                .addResourceLocations("file:" + uploadPath.toString() + "/avatars/")
                .setCachePeriod(3600)  // 添加缓存支持
                .resourceChain(true);  // 启用资源链优化
    }
} 