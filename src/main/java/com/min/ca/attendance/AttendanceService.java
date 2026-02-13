package com.min.ca.attendance;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.min.ca.group.ChurchGroup;
import com.min.ca.member.Member;
import com.min.ca.member.MemberRepository;
import com.min.ca.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final MemberRepository memberRepository;

    /**
     * 출결 데이터 저장 (2-Part Logic)
     * @param request DTO (날짜 + 학생 기록 리스트)
     * @param user    로그인한 속장(User)
     */
    @Transactional // 🔑 [중요] 두 개의 테이블을 수정하므로 트랜잭션으로 묶습니다.
    public void saveAttendance(AttendanceDto.SaveRequest request, User user) {
        
        // 1. 공통 정보 추출
        LocalDate attendanceDate = LocalDate.parse(request.getDate()); // "YYYY-MM-DD" 형식
        ChurchGroup group = user.getGroup();

        // 2. 학생 기록(records)을 하나씩 순회
        for (AttendanceDto.AttendanceRecordDto record : request.getRecords()) {
            
            // 3. 대상 학생(Member)을 DB에서 조회
            Member member = memberRepository.findById(record.getMemberId())
                    .orElseThrow(() -> new IllegalArgumentException("회원 없음: " + record.getMemberId()));

         // --- 
            // 🔑 [수정] 스냅샷 저장 (Attendance 테이블)
            // ---
            
            // a. 이 날짜의 '이전 스냅샷'을 DB에서 찾음
            Attendance attendance = attendanceRepository
                    .findByMemberIdAndDate(member.getId(), attendanceDate)
                    .orElse(null); // 🔑 없으면 null

            // b. '이전 달란트' 값을 저장 (없었으면 0)
            int oldTalent = (attendance != null) ? attendance.getTalent() : 0;
            
            // (스냅샷이 없으면 새 객체 생성)
            if (attendance == null) {
                attendance = new Attendance();
            }

            // c. 스냅샷 데이터 설정 (이제 talent 포함)
            attendance.setMember(member);
            attendance.setUser(user);
            attendance.setGroup(group);
            attendance.setDate(attendanceDate);
            attendance.setStatus(record.getStatus());
            attendance.setReason(record.getReason());
            attendance.setNote(record.getNote());
            attendance.setTalent(record.getTalent()); // 🔑 [신규] 새 달란트(예: 3)를 스냅샷에 저장
            
            attendanceRepository.save(attendance); 

            // ---
            // 🔑 [수정] 누적 달란트 저장 (Member 테이블)
            // ---
            
            int newTalent = record.getTalent(); // (예: 3)
            
            // d. '조정값'을 계산 (새 점수 - 이전 점수)
            // (예: 3 - 5 = -2)
            int adjustment = newTalent - oldTalent; 
            
            if (adjustment != 0) {
                // e. MEMBER 테이블을 '조정값'만큼만 업데이트
                member.setTalent(member.getTalent() + adjustment);
            }
        }
    }
    @Transactional(readOnly = true)
    public AttendanceDto.DayAttendanceResponse getAttendance(Long groupId, LocalDate date) {
        
    	LocalDate today = LocalDate.now();
        // 1. 해당 날짜의 '출결 스냅샷' 목록을 먼저 조회
        List<Attendance> attendanceRecords = attendanceRepository.findAllByGroupIdAndDate(groupId, date);
        
        List<Member> targetMembers; // 🔑 출결 대상자 리스트

        if (date.equals(today)) {
            // [Case 1: 오늘 날짜] (11-01)
            // 🔑 'is_active = 1'인 현재 멤버만 조회 (3명)
            targetMembers = memberRepository.findAllByGroup_IdAndIsActive(groupId, true);
            
            // (오늘 날짜라도 '수정하기' 모드일 수 있으니 스냅샷을 조회는 합니다)
            attendanceRecords = attendanceRepository.findAllByGroupIdAndDate(groupId, date);
            
        } else {
            // [Case 2: 과거 날짜] (10-28)
            // 🔑 'is_active' 상관없이 그날의 스냅샷을 조회
            attendanceRecords = attendanceRepository.findAllByGroupIdAndDate(groupId, date);
            
            if (!attendanceRecords.isEmpty()) {
                // 🔑 스냅샷에서 멤버 목록을 복원 (4명)
                targetMembers = attendanceRecords.stream()
                                    .map(Attendance::getMember)
                                    .collect(Collectors.toList());
            } else {
                // (과거인데 스냅샷이 없으면 빈 목록)
                targetMembers = new ArrayList<>();
            }
        }
        // 3. (성능 향상) 스냅샷을 Map으로 변환
        Map<Long, Attendance> attendanceMap = attendanceRecords.stream()
                .collect(Collectors.toMap(att -> att.getMember().getId(), att -> att));

        // 4. 'targetMembers'를 기준으로 DTO 생성
        List<AttendanceDto.LoadResponse> responseList = targetMembers.stream()
                .map(member -> {
                    Attendance snapshot = attendanceMap.get(member.getId());
                    return new AttendanceDto.LoadResponse(member, snapshot);
                })
                .collect(Collectors.toList());

        // 5. 최종 응답 DTO 래핑
        AttendanceDto.DayAttendanceResponse response = new AttendanceDto.DayAttendanceResponse();
        response.setRecords(responseList);
        response.setSnapshotLoaded(!attendanceRecords.isEmpty());
        
        return response;
    }
    
    @Transactional(readOnly = true)
    public List<LocalDate> getSavedDates(Long groupId) {
        return attendanceRepository.findDistinctDatesByGroupId(groupId);
    }
    
    @Transactional
    public void deleteAttendanceByDate(User user, LocalDate date) {
        
        // 1. 오늘 날짜가 맞는지 다시 한번 확인 (안전장치)
        LocalDate today = LocalDate.now();
        if (!date.equals(today)) {
            throw new AccessDeniedException("출결 기록은 당일 기록만 삭제할 수 있습니다.");
        }

        // 2. 오늘 날짜 + 내 그룹의 모든 스냅샷을 불러옴
        List<Attendance> recordsToDelete = attendanceRepository.findAllByGroupIdAndDate(user.getGroup().getId(), date);

        if (recordsToDelete.isEmpty()) {
            // 삭제할 기록이 없으면 함수 종료
            return;
        }

        // 3. [달란트 롤백] 삭제할 스냅샷을 순회하며 달란트를 롤백
        for (Attendance record : recordsToDelete) {
            int talentToRollback = record.getTalent(); // 👈 이 스냅샷에 저장된 점수 (예: 5)
            
            if (talentToRollback > 0) {
                Member member = record.getMember();
                // 🔑 멤버의 누적 달란트에서 롤백
                member.setTalent(member.getTalent() - talentToRollback);
                // (memberRepository.save(member)는 @Transactional이므로 필요 없음)
            }
        }
        
        // 4. [스냅샷 삭제] 오늘 날짜의 스냅샷 기록을 모두 삭제
        attendanceRepository.deleteAll(recordsToDelete);
    }
}