package com.min.ca.auth;

import com.min.ca.user.User;
import com.min.ca.user.UserRepository;
import com.min.ca.group.ChurchGroupRepository; 
import com.min.ca.auth.AuthDto.LoginRequest;
import com.min.ca.auth.AuthDto.LoginResponse;

// 🔑 추가된 import
import com.min.ca.jwt.JwtTokenProvider; 

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder; // 🔑 추가된 import
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository; 
    private final ChurchGroupRepository churchGroupRepository;

    // 🔑 추가: PasswordEncoder 주입
    private final PasswordEncoder passwordEncoder; 
    // 🔑 추가: JwtTokenProvider 주입
    private final JwtTokenProvider jwtTokenProvider; 
    
    
    // 🔑 [인증] 로그인 처리 로직 (수정)
    public LoginResponse authenticate(LoginRequest request) {
        
        // 1. 사용자 이름(username)으로 DB에서 회원 정보 조회 (User는 이미 UserDetails 구현)
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

        // 2. 비밀번호 검증 (평문 비교 -> 해시 비교로 변경)
        // 🔑 passwordEncoder.matches(사용자가 입력한 평문 암호, DB에 저장된 해시 암호)
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        
        // 3. 활성 상태 확인 (isEnabled()를 통해 처리되나, 명시적으로 유지)
        if (!user.isEnabled()) { // UserDetails의 isEnabled() 메서드 사용
            throw new IllegalArgumentException("비활성화된 계정입니다. 관리자에게 문의하세요.");
        }
        
        // 4. 인증 성공 -> JWT 생성
        
        // Spring Security의 인증 객체 생성
        // 🔑 Spring Security 내부에서 사용될 임시 Authentication 객체를 생성합니다.
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user, // principal (UserDetails 객체)
                null, // credentials (비밀번호는 이미 검증되었으므로 null)
                user.getAuthorities() // authorities (권한)
        );
        
        // JWT 토큰 생성
        String jwt = jwtTokenProvider.createToken(authentication);
        
        // 5. JWT를 포함하여 응답 DTO 반환 (생성자 수정됨)
        return new LoginResponse(user, jwt);
    }
    
    public AuthDto.LoginResponse getUserInfo(String username) {
        // Spring Security의 SecurityContextHolder를 통해 전달받은 username으로 DB 조회
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

        // JWT를 반환할 필요는 없으므로 토큰 필드를 빈 문자열로 넘깁니다.
        // React에서는 이 정보를 사용하여 로그인 상태를 복구합니다.
        return new AuthDto.LoginResponse(user, ""); 
    }
}