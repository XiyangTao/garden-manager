package cn.coderhythm.config;

import cn.coderhythm.model.ERole;
import cn.coderhythm.model.Role;
import cn.coderhythm.model.User;
import cn.coderhythm.models.MaintenanceCompany;
import cn.coderhythm.repository.MaintenanceCompanyRepository;
import cn.coderhythm.repository.RoleRepository;
import cn.coderhythm.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 数据初始化组件
 * 用于在应用启动时自动加载初始数据到数据库
 */
@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private MaintenanceCompanyRepository maintenanceCompanyRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting data initialization...");
        
        // 初始化角色
        initRoles();
        
        // 初始化管理员用户
        initAdminUser();
        
        // 初始化养护单位数据
        initMaintenanceCompanies();
        
        log.info("Data initialization completed.");
    }

    private void initRoles() {
        if (roleRepository.count() == 0) {
            log.info("Initializing roles...");
            
            Role roleUser = new Role();
            roleUser.setName(ERole.ROLE_USER);
            roleUser.setDescription("Regular user role");
            roleRepository.save(roleUser);

            Role roleModerator = new Role();
            roleModerator.setName(ERole.ROLE_MODERATOR);
            roleModerator.setDescription("Moderator role");
            roleRepository.save(roleModerator);

            Role roleAdmin = new Role();
            roleAdmin.setName(ERole.ROLE_ADMIN);
            roleAdmin.setDescription("Administrator role");
            roleRepository.save(roleAdmin);
            
            log.info("Roles initialized successfully.");
        }
    }

    private void initAdminUser() {
        if (userRepository.count() == 0) {
            log.info("Initializing admin user...");
            
            // 创建管理员用户
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@coderhythm.cn");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setFullName("系统管理员");
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());
            admin.setEnabled(true);
            
            // 分配管理员角色
            Set<Role> roles = new HashSet<>();
            roleRepository.findByName(ERole.ROLE_ADMIN).ifPresent(roles::add);
            admin.setRoles(roles);
            
            userRepository.save(admin);
            
            // 创建演示用户
            User demo = new User();
            demo.setUsername("demo");
            demo.setEmail("demo@coderhythm.cn");
            demo.setPassword(passwordEncoder.encode("Demo@123"));
            demo.setFullName("演示用户");
            demo.setPhone("13800138000");
            demo.setAddress("北京市朝阳区");
            demo.setBio("这是一个演示账号");
            demo.setCreatedAt(LocalDateTime.now());
            demo.setUpdatedAt(LocalDateTime.now());
            demo.setEnabled(true);
            
            // 分配用户角色
            Set<Role> userRoles = new HashSet<>();
            roleRepository.findByName(ERole.ROLE_USER).ifPresent(userRoles::add);
            demo.setRoles(userRoles);
            
            userRepository.save(demo);
            
            log.info("Admin and demo users initialized successfully.");
        }
    }
    
    /**
     * 初始化养护单位数据
     */
    private void initMaintenanceCompanies() {
        // 检查数据库中是否已存在养护单位数据
        if (maintenanceCompanyRepository.count() == 0) {
            log.info("开始初始化养护单位数据...");
            try {
                // 从 JSON 文件加载养护单位数据
                List<MaintenanceCompanyData> companyDataList = loadMaintenanceCompaniesFromFile();
                
                // 将数据保存到数据库
                for (MaintenanceCompanyData data : companyDataList) {
                    MaintenanceCompany company = new MaintenanceCompany(
                            data.getCompanyName(),
                            data.getCompanyType(),
                            data.getLegalPerson(),
                            data.getContactPerson(),
                            data.getContactPhone(),
                            data.getAddress()
                    );
                    maintenanceCompanyRepository.save(company);
                }
                
                log.info("养护单位数据初始化完成，共导入 {} 条数据。", companyDataList.size());
            } catch (IOException e) {
                log.error("初始化养护单位数据时出错: {}", e.getMessage(), e);
            }
        } else {
            log.info("数据库中已存在养护单位数据，跳过初始化。");
        }
    }
    
    /**
     * 从 JSON 文件加载养护单位数据
     * 
     * @return 养护单位数据列表
     * @throws IOException 如果文件读取失败
     */
    private List<MaintenanceCompanyData> loadMaintenanceCompaniesFromFile() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        ClassPathResource resource = new ClassPathResource("data/maintenance-companies.json");
        
        try (InputStream is = resource.getInputStream()) {
            return mapper.readValue(is, new TypeReference<List<MaintenanceCompanyData>>() {});
        }
    }
    
    /**
     * 用于解析 JSON 数据的内部类
     */
    private static class MaintenanceCompanyData {
        private String companyName;
        private String companyType;
        private String legalPerson;
        private String contactPerson;
        private String contactPhone;
        private String address;
        
        // 无参构造函数，用于 Jackson 反序列化
        public MaintenanceCompanyData() {
        }
        
        // Getters and Setters
        public String getCompanyName() {
            return companyName;
        }
        
        public void setCompanyName(String companyName) {
            this.companyName = companyName;
        }
        
        public String getCompanyType() {
            return companyType;
        }
        
        public void setCompanyType(String companyType) {
            this.companyType = companyType;
        }
        
        public String getLegalPerson() {
            return legalPerson;
        }
        
        public void setLegalPerson(String legalPerson) {
            this.legalPerson = legalPerson;
        }
        
        public String getContactPerson() {
            return contactPerson;
        }
        
        public void setContactPerson(String contactPerson) {
            this.contactPerson = contactPerson;
        }
        
        public String getContactPhone() {
            return contactPhone;
        }
        
        public void setContactPhone(String contactPhone) {
            this.contactPhone = contactPhone;
        }
        
        public String getAddress() {
            return address;
        }
        
        public void setAddress(String address) {
            this.address = address;
        }
    }
} 