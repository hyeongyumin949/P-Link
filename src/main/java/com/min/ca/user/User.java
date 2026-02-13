package com.min.ca.user;

import com.min.ca.group.ChurchGroup;
import jakarta.persistence.*;
import lombok.*;

// Spring Security 통합을 위한 import 추가
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;


@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = {"password"})
@Table(name = "USER")
// UserDetails 인터페이스 구현 추가
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // User ID (PK)

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    // 🔑 권한 (0: ADMIN, 1: 교구장, 2: 속장, 3: 예비속장)
    @Column(nullable = false)
    private int role;

    @Column(name = "is_youth", nullable = false)
    private boolean isYouth = false;

    // Soft Delete용
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "group_id", nullable = false)
    private ChurchGroup group;
    
    @Builder
    public User(String username, String password, String name, int role, ChurchGroup group, boolean isYouth, boolean isActive) {
        this.username = username;
        this.password = password;
        this.name = name;
        this.role = role;
        this.group = group;
        this.isYouth = isYouth;
        this.isActive = isActive;
    }

    
    // UserDetails 인터페이스 메서드 구현 시작
    
    // 🔑 Spring Security에게 사용자 권한 정보를 제공합니다.
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 'ROLE_0', 'ROLE_1' 등의 형태로 권한을 반환
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + this.role));
    }

    @Override
    public String getUsername() {
        return username; // 기존 username 필드 사용
    }

    @Override
    public String getPassword() {
        return password; // 기존 password 필드 사용
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // 🔑 계정 활성화 여부 (기존 is_active 필드 활용)
    @Override
    public boolean isEnabled() {
        return isActive;
    }
}