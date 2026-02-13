package com.min.ca.member; // (패키지 경로는 예시입니다)

import com.min.ca.group.ChurchGroup;
import com.min.ca.user.User; // 🔑 USER 엔티티와 연결

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 🔑 JPA는 기본 생성자 필요
@Table(name = "MEMBER")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 100)
    private String contact;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true; // 🔑 프론트엔드와 맞춘 camelCase
    
    @Column(nullable = false)
    private int talent = 0;
    
    @Builder
    public Member(String name, String contact, boolean isActive, User user, ChurchGroup group, int talent) {
        this.name = name;
        this.contact = contact;
        this.isActive = isActive;
        this.user = user;
        this.group = group;
        this.talent = talent;
    }

    // --- 관계 매핑 ---

    // 🔑 User(속장)와 Member(속원)의 관계 (N:1)
    // 한 명의 속장(User)이 여러 명의 속원(Member)을 관리
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // 🔑 DB의 user_id 컬럼
    private User user; 

    // 🔑 ChurchGroup(소속)과 Member(속원)의 관계 (N:1)
    // 하나의 그룹이 여러 명의 속원(Member)을 포함
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id") // 🔑 DB의 group_id 컬럼
    private ChurchGroup group;
}