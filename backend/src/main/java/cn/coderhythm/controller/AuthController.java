package cn.coderhythm.controller;

import cn.coderhythm.dto.request.LoginRequest;
import cn.coderhythm.dto.request.SignupRequest;
import cn.coderhythm.dto.response.JwtResponse;
import cn.coderhythm.dto.response.MessageResponse;
import cn.coderhythm.model.ERole;
import cn.coderhythm.model.Role;
import cn.coderhythm.model.User;
import cn.coderhythm.repository.RoleRepository;
import cn.coderhythm.repository.UserRepository;
import cn.coderhythm.security.jwt.JwtUtils;
import cn.coderhythm.security.service.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/auth")
@Slf4j
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        log.info("Test endpoint called");
        return ResponseEntity.ok(new MessageResponse("Auth service is up and running"));
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Authentication attempt for user: {}", loginRequest.getUsername());
        
        try {
            // 验证用户存在
            if (!userRepository.existsByUsername(loginRequest.getUsername())) {
                log.warn("Authentication failed: Username {} does not exist", loginRequest.getUsername());
                return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("用户名不存在"));
            }
            
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();        
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());
                    
            // Update last login time
            userRepository.findByUsername(userDetails.getUsername()).ifPresent(user -> {
                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);
            });

            log.info("User authenticated successfully: {}", userDetails.getUsername());


            return ResponseEntity.ok(new JwtResponse(jwt, 
                                                    userDetails.getId(), 
                                                    userDetails.getUsername(), 
                                                    userDetails.getEmail(),
                                                    userDetails.getFullName(),
                                                    userDetails.getNickname(),
                                                    userDetails.getAvatar(),
                                                    roles));
        } catch (BadCredentialsException e) {
            log.warn("Authentication failed for user {}: Bad credentials", loginRequest.getUsername());
            return ResponseEntity
                .badRequest()
                .body(new MessageResponse("账号名或登录密码不正确"));
        } catch (Exception e) {
            log.error("Authentication error for user {}: {}", loginRequest.getUsername(), e.getMessage(), e);
            return ResponseEntity
                .badRequest()
                .body(new MessageResponse("认证错误"));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        log.info("User registration request for: {}", signUpRequest.getUsername());
        
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            log.warn("Registration failed: Username {} is already taken", signUpRequest.getUsername());
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            log.warn("Registration failed: Email {} is already in use", signUpRequest.getEmail());
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        try {
            // Create new user's account
            User user = new User();
            user.setUsername(signUpRequest.getUsername());
            user.setEmail(signUpRequest.getEmail());
            user.setPassword(encoder.encode(signUpRequest.getPassword()));
            user.setFullName(signUpRequest.getFullName());
            user.setPhone(signUpRequest.getPhone());
            user.setAddress(signUpRequest.getAddress());
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());

            Set<String> strRoles = signUpRequest.getRoles();
            Set<Role> roles = new HashSet<>();

            if (strRoles == null) {
                Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                roles.add(userRole);
            } else {
                strRoles.forEach(role -> {
                    switch (role) {
                        case "admin":
                            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                            roles.add(adminRole);
                            break;
                        case "mod":
                            Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
                                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                            roles.add(modRole);
                            break;
                        default:
                            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                            roles.add(userRole);
                    }
                });
            }

            user.setRoles(roles);
            userRepository.save(user);

            log.info("User registered successfully: {}", signUpRequest.getUsername());
            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (Exception e) {
            log.error("Registration error for user {}: {}", signUpRequest.getUsername(), e.getMessage(), e);
            return ResponseEntity
                .badRequest()
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
} 