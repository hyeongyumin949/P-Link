package com.min.ca.attendance; // (Attendance.java와 동일한 패키지)

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // 🔑 1. (저장 시) 특정 날짜에 특정 회원의 출결 기록이 이미 있는지 확인 (중복 저장 방지)
    Optional<Attendance> findByMemberIdAndDate(Long memberId, LocalDate date);

    // 🔑 2. (조회 시) 특정 날짜에 특정 그룹의 모든 출결 기록을 조회 (출결판 로드용)
    List<Attendance> findAllByGroupIdAndDate(Long groupId, LocalDate date);
    
    @Query("SELECT DISTINCT a.date FROM Attendance a WHERE a.group.id = :groupId")
    List<LocalDate> findDistinctDatesByGroupId(@Param("groupId") Long groupId);
    
    @Query("SELECT DISTINCT a.date FROM Attendance a " +
            "JOIN a.group g " +
            "WHERE g.parent.id = :parishGroupId")
     List<LocalDate> findDistinctDatesByParish(@Param("parishGroupId") Long parishGroupId);
}