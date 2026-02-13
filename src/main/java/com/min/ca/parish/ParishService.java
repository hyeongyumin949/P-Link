package com.min.ca.parish;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.min.ca.attendance.AttendanceDto;
import com.min.ca.attendance.AttendanceRepository;
import com.min.ca.attendance.AttendanceService;
import com.min.ca.group.ChurchGroup;
import com.min.ca.group.ChurchGroupRepository;
import com.min.ca.user.User;
import com.min.ca.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ParishService {

    private final ChurchGroupRepository groupRepository;
    private final UserRepository userRepository;
    private final AttendanceService attendanceService;
    private final AttendanceRepository attendanceRepository;// 🔑 [핵심] 기존 출결 서비스 주입

    /**
     * 1. 교구장이 관리하는 모든 '속' 그룹 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ParishDto.GroupResponse> getSubGroups(User user) {
        // 1. 권한 검사 (Role 1: 교구장, Role 4: 교역자)
        checkParishAdminPermission(user);

        // 2. 교구장의 '교구' 그룹을 가져옴
        ChurchGroup parishGroup = user.getGroup();

        
        List<ChurchGroup> subGroups = groupRepository.findAllByParent(parishGroup);

        // 4. [성능 최적화] '속' 그룹들의 속장(Role 2) 목록을 '한 번의 쿼리'로 조회
        // (N+1 문제 방지)
        List<User> leaders = userRepository.findAllByGroupInAndRole(subGroups, 2);

        // 5. 속장 목록을 Map으로 변환 (Key: group_id, Value: User)
        Map<Long, User> leaderMap = leaders.stream()
                .collect(Collectors.toMap(leader -> leader.getGroup().getId(), leader -> leader));

        // 6. DTO로 조립하여 반환
        return subGroups.stream()
                .map(group -> {
                    User leader = leaderMap.get(group.getId());
                    return new ParishDto.GroupResponse(group, leader);
                })
                .collect(Collectors.toList());
    }

    /**
     * 2. 특정 '속' 그룹의 출결 데이터 조회
     */
    @Transactional(readOnly = true)
    public AttendanceDto.DayAttendanceResponse getGroupAttendance(User user, Long subGroupId, LocalDate date) {
        // 1. 권한 검사 (Role 1: 교구장, Role 4: 교역자)
        checkParishAdminPermission(user);

        // 2. [보안] 교구장이 조회하려는 '속(subGroupId)'이
        //    '자신의 교구' 소속이 맞는지 검증
        ChurchGroup subGroup = groupRepository.findById(subGroupId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 그룹입니다."));

        if (subGroup.getParent() == null || !subGroup.getParent().getId().equals(user.getGroup().getId())) {
            throw new AccessDeniedException("조회 권한이 없는 그룹입니다.");
        }
        return attendanceService.getAttendance(subGroupId, date);
    }


    // 권한 검사 헬퍼 메서드
    private void checkParishAdminPermission(User user) {
        if (user.getRole() != 1 && user.getRole() != 4) {
            throw new AccessDeniedException("교구장 또는 교역자만 접근 가능합니다.");
        }
    }
    
    @Transactional(readOnly = true)
    public List<LocalDate> getParishAttendanceDates(User user) {
        // 1. 권한 검사 (Role 1: 교구장, Role 4: 교역자)
        checkParishAdminPermission(user);

        // 2. 교구장의 '교구' 그룹 ID
        Long parishGroupId = user.getGroup().getId();

        // 3. 💡 [핵심 JPQL]
        //    '내 교구(parishGroupId)'를 '부모(parent)'로 가지는 '속' 그룹들의
        //    'Attendance' 기록에서 중복 없는 '날짜'만 모두 조회
        return attendanceRepository.findDistinctDatesByParish(parishGroupId);
    }
    
    @Transactional(readOnly = true)
    public List<ParishDto.SummaryResponse> getAttendanceSummary(User user, LocalDate date) {
        // 1. 권한 검사 (Role 1: 교구장, Role 4: 교역자)
        checkParishAdminPermission(user);

        // 2. 교구장의 '교구' 그룹
        ChurchGroup parishGroup = user.getGroup();

        // 3. 교구 산하 '모든 속' 그룹 목록 조회
        List<ChurchGroup> subGroups = groupRepository.findAllByParent(parishGroup);

        // 4. '모든 속'의 속장(Role 2) 목록을 '한 번의 쿼리'로 조회 (N+1 방지)
        List<User> leaders = userRepository.findAllByGroupInAndRole(subGroups, 2);
        Map<Long, User> leaderMap = leaders.stream()
                .collect(Collectors.toMap(leader -> leader.getGroup().getId(), leader -> leader));

        // 5. 💡 [핵심 로직]
        //    '모든 속'을 순회하며, 각 속의 출결 데이터를 조회하고 DTO로 조립
        return subGroups.stream()
                .map(group -> {
                    // 💡 [로직 재활용]
                    // 기존 'AttendanceService'의 로직을 그대로 재활용
                    AttendanceDto.DayAttendanceResponse groupData = 
                            attendanceService.getAttendance(group.getId(), date);
                    
                    User leader = leaderMap.get(group.getId());
                    
                    // 'SummaryResponse' DTO가 요약 정보를 자동 계산
                    return new ParishDto.SummaryResponse(group, leader, groupData);
                })
                .collect(Collectors.toList());
    }
}