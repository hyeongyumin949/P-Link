package com.min.ca.attendance; // (패키지 경로는 예시입니다)

import java.time.LocalDate;

import com.min.ca.group.ChurchGroup;
import com.min.ca.member.Member;
import com.min.ca.user.User;

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
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "ATTENDANCE")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private ChurchGroup group;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 20)
    private String status; // "Present" 또는 "Absent"
    
    @Column(nullable = false)
    private int talent = 0;

    // 🔑 [수정] 'talent' 필드 제거 (스냅샷이므로)

    @Column(length = 255)
    private String reason; // 결석 사유

    @Column(length = 255)
    private String note; // 🔑 출석 비고 (보고 사항)
    
    @Builder
    public Attendance(Member member, User user, ChurchGroup group, LocalDate date, String status, String reason, String note, int talent) {
        this.member = member;
        this.user = user;
        this.group = group;
        this.date = date;
        this.status = status;
        this.reason = reason;
        this.note = note;
        this.talent = talent;
    }
}