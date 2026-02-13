package com.min.ca.auth;

import com.min.ca.user.User;
import lombok.Getter;
import lombok.Setter;
 
public class AuthDto {
    // ... LoginRequest는 그대로 유지 ...
    @Getter @Setter
    public static class LoginRequest {
        private String username;
        private String password;
    }

    // 로그인 성공 후 React에 반환하는 데이터 (토큰 필드 추가)
    @Getter
    public static class LoginResponse {
        private final Long id;
        private final String name;
        private final int role;
        private final String groupName;
        private final String token;
        private Long groupId;
        private final boolean isYouth; // 🔑 1. [추가] is_youth 플래그 필드

        // 생성자 수정: 토큰을 인자로 받도록 변경
        public LoginResponse(User user, String token) {
            this.id = user.getId();
            this.name = user.getName();
            this.role = user.getRole();
            this.groupName = user.getGroup().getName();
            this.token = token;
            // 🔑 2. [추가] user 엔티티의 isYouth 값을 DTO에 복사
            //    (Lombok이 boolean 필드에 대해 isYouth()로 getter를 생성했을 수 있습니다)
            this.isYouth = user.isYouth(); 
        }
    }
}