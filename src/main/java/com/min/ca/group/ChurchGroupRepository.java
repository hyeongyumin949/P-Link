package com.min.ca.group;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChurchGroupRepository extends JpaRepository<ChurchGroup, Long> {
    
    // 🔑 특정 이름과 부모를 가진 그룹을 찾는 메서드 (계층 내 고유성 확인용)
    Optional<ChurchGroup> findByNameAndParent(String name, ChurchGroup parent);
    
    // 특정 부모 ID(교구 ID)를 가진 모든 하위 그룹(속)을 찾는 메서드 (조회용)
    List<ChurchGroup> findAllByParent(ChurchGroup parent);
    
    List<ChurchGroup> findAllByParentIsNull();
}