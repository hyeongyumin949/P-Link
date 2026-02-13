package com.min.ca.notice;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException; // 🔑 권한 예외
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.min.ca.group.ChurchGroup;
import com.min.ca.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final NoticeCommentRepository noticeCommentRepository;

    // --- 
    // 🔑 [핵심 1] 권한 검사 (글쓰기)
    // "글 작성 - 1, 4를 role 가지고, group_id가 parent_id가 없는 user만" [cite]
    // ---
    private void checkWritePermission(User user) {
        boolean hasRole = (user.getRole() == 1 || user.getRole() == 4);
        
        // 🔑 [수정] role 조건만 확인합니다.
        if (!hasRole) {
            throw new AccessDeniedException("공지사항 작성 권한이 없습니다.");
        }
    }

    // ---
    // 🔑 [핵심 2] 조회 범위 (Scoping)
    // "group_id를 통해서 또 교구끼리만 볼 수 있게 하는거고" [cite]
    // ---
    private ChurchGroup findMyParishGroup(User user) {
        // 1. 내가 속장(Role 2)이고 부모 그룹이 있다면, 내 부모 그룹(교구)을 반환
        if (user.getRole() == 2 && user.getGroup().getParent() != null) {
            return user.getGroup().getParent();
        }
        // 2. 그 외 (교구장/담당교역자)는 내 그룹(교구)을 반환
        return user.getGroup();
    }

    /**
     * 1. 공지사항 목록 조회 (내 교구만)
     */
    @Transactional(readOnly = true)
    public List<NoticeDto.NoticeResponse> getNoticeList(User user) {
        // 1. 내가 속한 '교구'를 찾음
        ChurchGroup myParish = findMyParishGroup(user);
        
        // 2. 해당 교구의 공지사항만 조회
        List<Notice> notices = noticeRepository.findAllByParishGroupOrderByCreatedDateDesc(myParish);

        // 3. DTO로 변환
        return notices.stream()
                .map(NoticeDto.NoticeResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * 2. 공지사항 상세 조회 (내 교구만)
     */
    @Transactional(readOnly = true)
    public NoticeDto.NoticeDetailResponse getNoticeDetail(User user, Long noticeId) {
        // 1. 공지사항 조회
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        // 2. [보안] 내가 속한 '교구'를 찾음
        ChurchGroup myParish = findMyParishGroup(user);
        
        // 3. [보안] 이 게시글이 내 교구의 글이 맞는지 확인
        if (!notice.getParishGroup().getId().equals(myParish.getId())) {
            throw new AccessDeniedException("이 게시글을 볼 권한이 없습니다.");
        }

        // 4. 댓글 목록 조회
        List<NoticeComment> comments = noticeCommentRepository.findAllByNoticeOrderByCreatedDateAsc(notice);

        // 5. DTO로 변환
        NoticeDto.NoticeDetailResponse responseDto = new NoticeDto.NoticeDetailResponse(notice, comments);
        
        responseDto.setAuthor(notice.getAuthor().getId().equals(user.getId()));
        
        System.out.println("[Debug 1] 로그인 User ID: " + user.getId() + ", 이름: " + user.getName());
        // 6. [추가] 댓글의 'isAuthor' (본인 글 여부) 설정
        responseDto.getComments().forEach(commentDto -> {
            NoticeComment originalComment = comments.stream()
                .filter(c -> c.getId().equals(commentDto.getId()))
                .findFirst()
                .orElse(null);

            if (originalComment != null) {
                Long commentAuthorId = originalComment.getAuthor().getId();
                Long currentUserId = user.getId();
                boolean isAuthorMatch = commentAuthorId.equals(currentUserId);
                
                // 🔑 [디버깅 2] 댓글 ID별로 작성자 ID와 로그인 ID를 비교
                System.out.println(
                    "[Debug 2] 댓글 ID " + commentDto.getId() + 
                    " | 댓글 작성자 ID: " + commentAuthorId + 
                    " | 로그인 ID: " + currentUserId + 
                    " | 일치 여부: " + isAuthorMatch
                );
                
                commentDto.setAuthor(isAuthorMatch);
            }
        });
        
        return responseDto;
    }

    /**
     * 3. 공지사항 작성
     */
    @Transactional
    public NoticeDto.NoticeResponse createNotice(User user, NoticeDto.CreateNoticeRequest request) {
        // 1. [권한 검사] 글 쓸 자격이 있는지 확인
        checkWritePermission(user);

        // 2. 엔티티 생성
        Notice notice = Notice.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .isImportant(request.isImportant())
                .author(user)
                .parishGroup(user.getGroup()) // 🔑 글쓴이의 그룹(교구)을 저장
                .build();
        
        Notice savedNotice = noticeRepository.save(notice);
        return new NoticeDto.NoticeResponse(savedNotice);
    }
    
    /**
     * 4. 댓글 작성 (모든 사람이 가능)
     */
    @Transactional
    public NoticeDto.CommentResponse createComment(User user, Long noticeId, NoticeDto.CreateCommentRequest request) {
        // 1. 원본 게시글 조회 (권한 검사 겸용)
        // (getNoticeDetail이 내 교구 글이 아니면 AccessDeniedException을 던짐)
        getNoticeDetail(user, noticeId); 
        
        // 2. (getNoticeDetail을 통과했으므로) 게시글 엔티티 다시 조회
        Notice notice = noticeRepository.findById(noticeId).get();

        // 3. 댓글 엔티티 생성
        NoticeComment comment = NoticeComment.builder()
                .content(request.getContent())
                .author(user)
                .notice(notice)
                .build();
        
        NoticeComment savedComment = noticeCommentRepository.save(comment); // 👈 엔티티 저장

        // 🔑 2. 저장된 엔티티를 DTO로 변환하여 반환
        return new NoticeDto.CommentResponse(savedComment);
    }
    
    @Transactional
    public void deleteComment(User user, Long commentId) {
        // 1. 댓글 조회
        NoticeComment comment = noticeCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));

        // 2. [권한 검사] 댓글 작성자 ID와 현재 로그인한 사용자 ID가 일치하는지 확인
        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new AccessDeniedException("댓글을 삭제할 권한이 없습니다.");
        }
        
        // 3. 삭제 실행
        noticeCommentRepository.delete(comment);
    }
    
    @Transactional
    public void deleteNotice(User user, Long noticeId) {
        // 1. 게시글 조회
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        // 2. [권한 검사]
        boolean isAuthor = notice.getAuthor().getId().equals(user.getId());
        boolean isManager = (user.getRole() == 1 || user.getRole() == 4);

        if (!isAuthor && !isManager) { // 👈 본인도 아니고, 관리자도 아니면
            throw new AccessDeniedException("게시글을 삭제할 권한이 없습니다.");
        }
        
        // 3. 삭제 실행 (1단계의 Cascade 설정으로 댓글이 함께 삭제됨)
        noticeRepository.delete(notice);
    }
    
    @Transactional
    public NoticeDto.NoticeResponse updateNotice(User user, Long noticeId, NoticeDto.CreateNoticeRequest request) {
        // 1. 게시글 조회
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        // 2. [권한 검사] (삭제 로직과 동일)
        boolean isAuthor = notice.getAuthor().getId().equals(user.getId());
        boolean isManager = (user.getRole() == 1 || user.getRole() == 4);

        if (!isAuthor && !isManager) {
            throw new AccessDeniedException("게시글을 수정할 권한이 없습니다.");
        }
        
        // 3. [수정] DTO의 내용으로 엔티티 필드 값 변경
        // (JPA '더티 체킹'이 @Transactional 종료 시 UPDATE 쿼리 실행)
        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        notice.setImportant(request.isImportant());
        // (setter는 Notice.java에 @Setter가 필요합니다)
        
        return new NoticeDto.NoticeResponse(notice);
    }
}