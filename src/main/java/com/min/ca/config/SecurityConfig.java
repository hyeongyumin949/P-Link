package com.min.ca.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.min.ca.jwt.JwtAuthenticationFilter;
import com.min.ca.jwt.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final JwtTokenProvider jwtTokenProvider;
    // 1. PasswordEncoder Bean 등록 (비밀번호 해시 및 검증용)
    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCryptPasswordEncoder는 강력하고 널리 사용되는 해시 알고리즘입니다.
        return new BCryptPasswordEncoder();
    }
    
    
    // 2. Spring Security 필터 체인 설정
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        
    	http
        // 1. [CORS 설정] (이것이 POST/PUT/DELETE를 허용)
        .cors(cors -> cors.configurationSource(corsConfigurationSource())) 
            
        // 2. [CSRF 설정] (403 에러의 주범)
        // JWT를 사용하는 stateless 방식이므로 CSRF 보호를 끈다
        .csrf(AbstractHttpConfigurer::disable)
        
        .httpBasic(AbstractHttpConfigurer::disable)
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        
        // 3. [경로 권한 설정]
        .authorizeHttpRequests(authorize -> authorize
            .requestMatchers("/api/auth/**").permitAll() 
            .requestMatchers("/api/members/**").authenticated()
            .requestMatchers("/api/attendance/**").authenticated()
            .requestMatchers("/api/notice/**").authenticated()
            .requestMatchers("/api/parish/**").authenticated()
            .requestMatchers("/api/places/**").authenticated()
            .requestMatchers("/api/reservation/**").authenticated()
            .anyRequest().authenticated()
        )
        
        .addFilterBefore(
            new JwtAuthenticationFilter(jwtTokenProvider), 
            UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // React 앱의 주소(localhost:3000) 허용
        configuration.setAllowedOrigins(Arrays.asList("https://p-link-frontend-production.up.railway.app")); 
        
        // 🔑 [핵심] "POST"를 포함한 모든 메소드 허용
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // 모든 헤더 허용
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // 자격 증명(토큰 등) 허용
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 URL에 이 설정을 적용
        return source;
    }
}