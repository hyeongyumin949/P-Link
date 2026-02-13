package com.min.ca.notice;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import lombok.Getter;
import lombok.Setter;

public class NoticeDto {

    // --- 1. 게시글 목록 조회용 (List) ---
    @Getter
    public static class NoticeResponse {
        private Long id;
        private String title;
        private String authorName;
        private LocalDateTime createdDate;
        private boolean isImportant;

        // Notice 엔티티를 DTO로 변환
        public NoticeResponse(Notice notice) {
            this.id = notice.getId();
            this.title = notice.getTitle();
            this.authorName = notice.getAuthor().getName();
            this.createdDate = notice.getCreatedDate();
            this.isImportant = notice.isImportant();
        }
    }

    // --- 2. 게시글 상세 조회용 (Detail) ---
    @Getter
    @Setter
    public static class NoticeDetailResponse {
        private Long id;
        private String title;
        private String content;
        private String authorName;
        private LocalDateTime createdDate;
        private boolean isImportant;
        private List<CommentResponse> comments; // 🔑 댓글 목록 포함
        private boolean isAuthor;

        // Notice 엔티티와 Comment 리스트를 DTO로 변환
        public NoticeDetailResponse(Notice notice, List<NoticeComment> comments) {
            this.id = notice.getId();
            this.title = notice.getTitle();
            this.content = notice.getContent();
            this.authorName = notice.getAuthor().getName();
            this.createdDate = notice.getCreatedDate();
            this.isImportant = notice.isImportant();
            this.comments = comments.stream()
                                .map(CommentResponse::new)
                                .collect(Collectors.toList());
            this.isAuthor = false;
        }
    }

    // --- 3. 댓글 조회용 (Comment) ---
    @Getter
    @Setter // 🔑 1. [추가] Service에서 isAuthor를 설정할 수 있도록 @Setter 추가
    public static class CommentResponse {
        private Long id;
        private String content;
        private String authorName;
        private LocalDateTime createdDate;
        private boolean isAuthor; // 🔑 (Service에서 이 값을 채워줌)

        public CommentResponse(NoticeComment comment) {
            this.id = comment.getId();
            this.content = comment.getContent();
            this.authorName = comment.getAuthor().getName();
            this.createdDate = comment.getCreatedDate();
            this.isAuthor = false; // (기본값 false)
        }
    }
    // --- 4. 게시글 작성용 (Request) ---
    @Getter
    @Setter
    public static class CreateNoticeRequest {
        private String title;
        private String content;
        private boolean isImportant;
    }

    // --- 5. 댓글 작성용 (Request) ---
    @Getter
    @Setter
    public static class CreateCommentRequest {
        private String content;
    }
}