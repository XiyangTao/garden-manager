package cn.coderhythm.config;

import cn.coderhythm.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * 应用程序启动时初始化文件存储目录
 */
@Component
@Slf4j
public class FileStorageInitializer implements CommandLineRunner {

    @Autowired
    private FileStorageService fileStorageService;

    @Override
    public void run(String... args) {
        log.info("初始化文件存储目录...");
        fileStorageService.init();
        log.info("文件存储目录初始化完成");
    }
} 