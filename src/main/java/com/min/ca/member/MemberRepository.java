package com.min.ca.member; // (Member.java와 동일한 패키지)


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    
	// 🔑 [수정] (findAllByGroup_IdAndIsActive -> findAllByGroup_IdAndIsActive)
    List<Member> findAllByGroup_IdAndIsActive(Long groupId, boolean isActive);

    // 🔑 [신규] is_active와 상관없이 그룹 ID로 모든 멤버 찾기 (findAllByGroup_Id는 JPA 기본 키워드)
    List<Member> findAllByGroup_Id(Long groupId);
}