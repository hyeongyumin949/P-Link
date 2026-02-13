package com.min.ca.notice; // (Notice.java와 동일한 패키지)

import com.min.ca.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "NOTICE_COMMENT")
public class NoticeComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long id;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    // --- 관계 매핑 ---

    // 🔑 이 댓글을 작성한 사람 (User)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    // 🔑 이 댓글이 달린 게시글 (Notice)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notice_id", nullable = false)
    private Notice notice;

    @Builder
    public NoticeComment(String content, User author, Notice notice) {
        this.content = content;
        this.author = author;
        this.notice = notice;
        this.createdDate = LocalDateTime.now();
    }
}