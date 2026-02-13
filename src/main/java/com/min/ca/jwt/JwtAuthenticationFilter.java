package com.min.ca.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    // HTTP 헤더에서 토큰을 추출할 때 사용되는 접두사
    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";

    /**
     * HTTP 요청이 들어올 때마다 한 번씩 실행되어 토큰을 검증하고 인증 처리
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. HTTP 요청 헤더에서 JWT 추출
        String jwt = resolveToken(request);

        // 2. 추출된 토큰의 유효성 검증
        if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {
            
            // 3. 토큰이 유효하면 인증 정보(Authentication) 객체 획득
            Authentication authentication = jwtTokenProvider.getAuthentication(jwt);

            // 4. Spring Security의 SecurityContext에 인증 정보 저장 (로그인 상태 유지)
            // 🔑 이 코드가 실행되면, 해당 요청에 대해 사용자가 인증된 상태가 됩니다.
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 다음 필터로 요청을 전달
        filterChain.doFilter(request, response);
    }

    /**
     * HTTP 요청 헤더에서 토큰 정보를 추출합니다.
     * @param request HTTP 요청
     * @return JWT 문자열 (없으면 null)
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        // "Authorization: Bearer [JWT]" 형식인지 확인하고 "Bearer "를 제거한 JWT 부분만 반환
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}