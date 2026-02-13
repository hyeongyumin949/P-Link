package com.min.ca.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    // application.properties 또는 application.yml에서 설정할 JWT Secret Key
    // 🔑 보안을 위해 256비트 이상(32글자)의 무작위 문자열을 권장합니다.
    @Value("${jwt.secret}")
    private String secretKey;

    // 토큰 만료 시간 (예: 30분 = 30 * 60 * 1000L)
    @Value("${jwt.token-validity-in-seconds}")
    private long tokenValidityInMilliseconds; 
    
    private final UserDetailsService userDetailsService;
    
    private Key key;

    // 생성자 주입
    public JwtTokenProvider(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    // 객체 초기화 시 SecretKey를 Base64 Decode하여 Key 객체로 저장
    @PostConstruct
    public void init() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 1. JWT 토큰 생성
     * @param authentication 인증된 사용자 정보
     * @return 생성된 JWT 문자열
     */
    public String createToken(Authentication authentication) {
        
        // 사용자 이름(username)을 토큰의 Subject(제목)으로 설정
        String username = authentication.getName();
        
        // 토큰 만료 시간 설정
        Date now = new Date();
        Date validity = new Date(now.getTime() + tokenValidityInMilliseconds);

        return Jwts.builder()
                .setSubject(username)       // 토큰 제목 (사용자 이름)
                .claim("roles", authentication.getAuthorities()) // 권한 정보 (선택적)
                .setIssuedAt(now)           // 토큰 발행 시간
                .setExpiration(validity)    // 토큰 만료 시간
                .signWith(key, SignatureAlgorithm.HS512) // 시크릿 키와 해시 알고리즘으로 서명
                .compact();
    }

    /**
     * 2. 토큰을 복호화하여 인증 정보 획득
     * @param token JWT 문자열
     * @return Spring Security의 Authentication 객체
     */
    public Authentication getAuthentication(String token) {
        // 토큰에서 사용자 이름을 추출
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        
        String username = claims.getSubject();

        // 추출된 사용자 이름으로 UserDetailsService를 통해 DB에서 UserDetails 객체 로드
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        // Spring Security의 인증 객체 생성 및 반환
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

    /**
     * 3. 토큰 유효성 검증
     * @param token JWT 문자열
     * @return 유효성 여부 (true/false)
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            // 잘못된 JWT 서명
            // log.info("잘못된 JWT 서명입니다.", e);
        } catch (ExpiredJwtException e) {
            // 만료된 JWT 토큰
            // log.info("만료된 JWT 토큰입니다.", e);
        } catch (UnsupportedJwtException e) {
            // 지원되지 않는 JWT 토큰
            // log.info("지원되지 않는 JWT 토큰입니다.", e);
        } catch (IllegalArgumentException e) {
            // JWT 토큰이 잘못되었습니다.
            // log.info("JWT 토큰이 잘못되었습니다.", e);
        }
        return false;
    }
}