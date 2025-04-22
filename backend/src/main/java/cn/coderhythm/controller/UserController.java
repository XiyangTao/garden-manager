package cn.coderhythm.controller;

import cn.coderhythm.dto.response.MessageResponse;
import cn.coderhythm.model.User;
import cn.coderhythm.repository.UserRepository;
import cn.coderhythm.security.service.UserDetailsImpl;
import cn.coderhythm.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Optional<User> userOptional = userRepository.findById(userDetails.getId());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            // 创建响应数据，排除敏感字段如密码
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            response.put("nickname", user.getNickname());
            response.put("phone", user.getPhone());
            response.put("address", user.getAddress());
            response.put("avatar", user.getAvatar());
            response.put("bio", user.getBio());
            response.put("createdAt", user.getCreatedAt());
            response.put("lastLogin", user.getLastLogin());
            
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateUserProfile(@RequestBody Map<String, Object> updates) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Optional<User> userOptional = userRepository.findById(userDetails.getId());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            // 更新用户信息
            if (updates.containsKey("fullName")) {
                user.setFullName((String) updates.get("fullName"));
            }
            if (updates.containsKey("nickname")) {
                user.setNickname((String) updates.get("nickname"));
            }
            if (updates.containsKey("phone")) {
                user.setPhone((String) updates.get("phone"));
            }
            if (updates.containsKey("address")) {
                user.setAddress((String) updates.get("address"));
            }
            if (updates.containsKey("bio")) {
                user.setBio((String) updates.get("bio"));
            }
            
            // 处理头像上传
            if (updates.containsKey("avatar")) {
                String base64Image = (String) updates.get("avatar");
                try {
                    // 删除旧头像文件
                    String oldAvatarPath = user.getAvatar();
                    if (oldAvatarPath != null && !oldAvatarPath.startsWith("http")) {
                        fileStorageService.deleteOldAvatar(oldAvatarPath);
                    }
                    
                    // 保存新头像
                    String avatarPath = fileStorageService.saveBase64Image(base64Image, user.getId());
                    if (avatarPath != null) {
                        user.setAvatar(avatarPath);
                    }
                } catch (IOException e) {
                    return ResponseEntity.badRequest().body(new MessageResponse("Error: Failed to save avatar image"));
                }
            }
            
            // 处理密码更改
            boolean passwordUpdated = false;
            if (updates.containsKey("currentPassword") && updates.containsKey("newPassword")) {
                String currentPassword = (String) updates.get("currentPassword");
                String newPassword = (String) updates.get("newPassword");
                
                if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                    return ResponseEntity.badRequest().body(new MessageResponse("Error: Current password is incorrect"));
                }
                
                user.setPassword(passwordEncoder.encode(newPassword));
                passwordUpdated = true;
            }
            
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            
            // 返回响应，如果密码被更新则包含密码更新标志
            Map<String, Object> response = new HashMap<>();
            response.put("message", passwordUpdated ? "Password updated successfully" : "Profile updated successfully");
            response.put("nickname", user.getNickname());
            response.put("avatar", user.getAvatar());
            response.put("fullName", user.getFullName());
            
            if (passwordUpdated) {
                response.put("passwordChanged", true);
            }
            
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            return ResponseEntity.ok(userOptional.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        userRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }
} 