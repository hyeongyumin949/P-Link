package com.min.ca.group;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "CHURCH_GROUP") // DB 테이블명과 일치
public class ChurchGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Long id; // PK

    @Column(name = "group_name", nullable = false, length = 50)
    private String name;

    // 🔑 Self-Join: 상위 그룹(교구)의 ID를 참조하는 객체
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private ChurchGroup parent; // 상위 그룹 엔티티 참조

    @Builder
    public ChurchGroup(String name, ChurchGroup parent) {
        this.name = name;
        this.parent = parent;
    }
}