package cn.coderhythm.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String nickname;
    private String avatar;
    private List<String> roles;

    public JwtResponse(String accessToken, Long id, String username, String email, String fullName, String nickname, String avatar, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.nickname = nickname;
        this.avatar = avatar;
        this.roles = roles;
    }
} 