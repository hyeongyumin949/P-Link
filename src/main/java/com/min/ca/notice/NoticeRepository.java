package com.min.ca.notice; // (Notice.java와 동일한 패키지)

import com.min.ca.group.ChurchGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {

    /**
     * 🔑 [핵심] 특정 교구 그룹(parishGroup)에 속한 모든 공지사항을
     * 최신순(createdDate 내림차순)으로 정렬하여 조회합니다.
     */
    List<Notice> findAllByParishGroupOrderByCreatedDateDesc(ChurchGroup parishGroup);
}