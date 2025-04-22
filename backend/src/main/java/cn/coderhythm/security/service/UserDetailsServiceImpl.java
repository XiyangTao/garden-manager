package cn.coderhythm.security.service;

import cn.coderhythm.model.User;
import cn.coderhythm.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 尝试先使用新的方法获取完整信息
        User user = userRepository.findUserWithDetailsById(username)
                .orElse(null);
        
        // 如果新方法没有结果，回退到原始方法
        if (user == null) {
            log.warn("找不到使用完整查询的用户，回退到简单查询: {}", username);
            user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + username));
        }
        
        // 打印用户信息以便调试
        log.info("加载用户信息: username={}, nickname={}, avatar={}", 
                user.getUsername(), user.getNickname(), user.getAvatar());
                
        return UserDetailsImpl.build(user);
    }
} 