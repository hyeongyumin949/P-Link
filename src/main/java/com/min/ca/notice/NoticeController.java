package com.min.ca.notice;

import com.min.ca.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notice") // 🔑 공지사항 API 기본 주소
public class NoticeController {

    private final NoticeService noticeService;

    /**
     * 1. 공지사항 목록 조회 (GET /api/notice)
     * (자신이 속한 교구의 목록만 보임)
     */
    @GetMapping
    public ResponseEntity<List<NoticeDto.NoticeResponse>> getMyNoticeList(
            @AuthenticationPrincipal User user) {
        
        List<NoticeDto.NoticeResponse> notices = noticeService.getNoticeList(user);
        return ResponseEntity.ok(notices);
    }

    /**
     * 2. 공지사항 상세 조회 (GET /api/notice/{noticeId})
     * (자신이 속한 교구의 게시글이 아니면 403 에러 발생)
     */
    @GetMapping("/{noticeId}")
    public ResponseEntity<NoticeDto.NoticeDetailResponse> getNoticeDetail(
            @AuthenticationPrincipal User user,
            @PathVariable("noticeId") Long noticeId) {
        
        NoticeDto.NoticeDetailResponse noticeDetail = noticeService.getNoticeDetail(user, noticeId);
        return ResponseEntity.ok(noticeDetail);
    }

    /**
     * 3. 공지사항 작성 (POST /api/notice)
     * (Role 1 또는 4 + 최상위 교구장만 가능)
     */
    @PostMapping
    public ResponseEntity<NoticeDto.NoticeResponse> createNotice( // 🔑 1. DTO로 변경
            @AuthenticationPrincipal User user,
            @RequestBody NoticeDto.CreateNoticeRequest request) {

        NoticeDto.NoticeResponse newNoticeDto = noticeService.createNotice(user, request); // 🔑 2. DTO로 받음
        return ResponseEntity.status(HttpStatus.CREATED).body(newNoticeDto); // 🔑 3. DTO로 반환
    }

    /**
     * 4. 댓글 작성 (POST /api/notice/{noticeId}/comments)
     * (모든 사용자가 가능)
     */
    @PostMapping("/{noticeId}/comments")
    public ResponseEntity<NoticeDto.CommentResponse> createComment(
            @AuthenticationPrincipal User user,
            @PathVariable("noticeId") Long noticeId,
            @RequestBody NoticeDto.CreateCommentRequest request) {
        
    	NoticeDto.CommentResponse newCommentDto = noticeService.createComment(user, noticeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(newCommentDto);
    }
    
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @AuthenticationPrincipal User user,
            @PathVariable("commentId") Long commentId) { // 🔑 (@PathVariable 이름 명시)
        
        noticeService.deleteComment(user, commentId);
        return ResponseEntity.ok().build(); // 200 OK (성공)
    }
    
    @DeleteMapping("/{noticeId}")
    public ResponseEntity<Void> deleteNotice(
            @AuthenticationPrincipal User user,
            @PathVariable("noticeId") Long noticeId) { // 🔑 (@PathVariable 이름 명시)
        
        noticeService.deleteNotice(user, noticeId);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{noticeId}")
    public ResponseEntity<NoticeDto.NoticeResponse> updateNotice( // 🔑 1. DTO로 변경
            @AuthenticationPrincipal User user,
            @PathVariable("noticeId") Long noticeId,
            @RequestBody NoticeDto.CreateNoticeRequest request) {

        NoticeDto.NoticeResponse updatedNoticeDto = noticeService.updateNotice(user, noticeId, request); // 🔑 2. DTO로 받음
        return ResponseEntity.ok(updatedNoticeDto); // 🔑 3. DTO로 반환
    }
}