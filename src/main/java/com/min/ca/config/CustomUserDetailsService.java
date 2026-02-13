package com.min.ca.config;

import com.min.ca.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
// 🔑 UserDetailsService 인터페이스를 구현하여 Spring Security가 사용자 정보를 로드하는 방식을 정의
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Spring Security의 핵심 메서드: username으로 DB에서 사용자 정보(User Entity)를 로드
     * @param username 사용자 ID
     * @return UserDetails 객체 (우리의 경우 User.java)
     * @throws UsernameNotFoundException 해당 사용자가 DB에 없을 경우
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // UserRepository를 사용하여 DB에서 사용자 정보를 조회
        return userRepository.findByUsername(username)
                // 사용자가 없으면 예외 발생
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));
        // 반환된 User 객체는 이미 UserDetails를 구현했으므로 바로 사용됩니다.
    }
}