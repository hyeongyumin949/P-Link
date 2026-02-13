package com.min.ca.notice; // (패키지 경로는 예시입니다)

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.min.ca.group.ChurchGroup;
import com.min.ca.user.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
@Table(name = "NOTICE")
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_id")
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Lob // 🔑 긴 텍스트(내용)를 저장하기 위해
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_important", nullable = false)
    private boolean isImportant = false; // (필독 공지 기능)

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    // --- 관계 매핑 ---

    // 🔑 이 공지를 작성한 사람 (User)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    // 🔑 [핵심] 이 공지가 소속된 '교구' (최상위 그룹)
    // 이 group_id를 기준으로 속장들이 공지사항을 보게 됩니다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private ChurchGroup parishGroup;
    
    @OneToMany(mappedBy = "notice", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<NoticeComment> comments = new ArrayList<>();

    @Builder
    public Notice(String title, String content, boolean isImportant, User author, ChurchGroup parishGroup) {
        this.title = title;
        this.content = content;
        this.isImportant = isImportant;
        this.author = author;
        this.parishGroup = parishGroup;
        this.createdDate = LocalDateTime.now();
    }
}