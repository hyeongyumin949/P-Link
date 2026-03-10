package com.min.ca.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.min.ca.auth.AuthDto.LoginRequest;

import lombok.RequiredArgsConstructor; 

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    // 🔑 [POST] 로그인 API 엔드포인트
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthDto.LoginResponse response = authService.authenticate(request);
            
            // 인증 성공: 200 OK
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            // 인증 실패: 401 Unauthorized
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .body("Login failed: " + e.getMessage());
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getUserInfo(@AuthenticationPrincipal UserDetails userDetails) {
        // 토큰이 유효하지 않으면 JwtAuthenticationFilter에서 401 에러를 반환하므로, 
        // 이 메서드가 실행된다는 것은 토큰이 유효하다는 뜻입니다.
        if (userDetails == null) {
            // 이럴 일은 거의 없지만, 인증 정보가 없는 경우 안전 장치
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 정보가 없습니다.");
        }
        
        try {
            // UserDetails의 getUsername()을 사용하여 서비스 로직 호출
            AuthDto.LoginResponse response = authService.getUserInfo(userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            // DB에서 사용자를 찾을 수 없는 경우
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("사용자를 찾을 수 없습니다.");
        }
    }
    
    @GetMapping("/groups/top-level")
    public ResponseEntity<?> getTopLevelGroups() {
        return ResponseEntity.ok(authService.getTopLevelGroups());
    }

    // 2. 특정 교구의 하위 속 목록 API
    @GetMapping("/groups/{parentId}/sub-groups")
    public ResponseEntity<?> getSubGroups(@PathVariable("parentId") Long parentId) {
        return ResponseEntity.ok(authService.getSubGroups(parentId));
    }

    // 3. 회원가입 처리 API
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody AuthDto.SignupRequest request) {
        try {
            authService.signup(request);
            // 성공 시 프론트엔드로 승인 대기 메시지 전달
            return ResponseEntity.ok("가입 신청이 완료되었습니다. 관리자의 승인을 기다려주세요.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}