package com.min.ca.notice; // (Notice.java와 동일한 패키지)

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoticeCommentRepository extends JpaRepository<NoticeComment, Long> {

    /**
     * 🔑 [핵심] 특정 게시글(Notice)에 달린 모든 댓글을
     * 작성순(createdDate 오름차순)으로 정렬하여 조회합니다.
     */
    List<NoticeComment> findAllByNoticeOrderByCreatedDateAsc(Notice notice);
}