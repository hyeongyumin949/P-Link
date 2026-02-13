package com.min.ca.parish;

import com.min.ca.attendance.AttendanceDto;
import com.min.ca.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/parish") // 👈 교구장(관리자)용 새 API 경로
public class ParishController {

    private final ParishService parishService;

    /**
     * 1. (교구장) 내가 관리하는 '속(sub-group)' 목록 전체 조회
     * [GET] /api/parish/groups
     */
    @GetMapping("/groups")
    public ResponseEntity<List<ParishDto.GroupResponse>> getMyParishGroups(
            @AuthenticationPrincipal User user) {
        
        List<ParishDto.GroupResponse> subGroups = parishService.getSubGroups(user);
        return ResponseEntity.ok(subGroups);
    }

    /**
     * 2. (교구장) 특정 '속'의 특정 날짜 출결 기록 조회
     * [GET] /api/parish/attendance?groupId=...&date=...
     *
     * @param user     (인증) 교구장/관리자
     * @param groupId  (조회 대상) '속' 그룹의 ID
     * @param date     (조회 대상) 날짜 (YYYY-MM-DD)
     */
    @GetMapping("/attendance")
    public ResponseEntity<AttendanceDto.DayAttendanceResponse> getGroupAttendance(
            @AuthenticationPrincipal User user,
            @RequestParam("groupId") Long groupId,
            @RequestParam("date") String date) {

        LocalDate attendanceDate = LocalDate.parse(date);
        
        // 🔑 [핵심] 기존 출결 조회 로직 재사용
        AttendanceDto.DayAttendanceResponse response = 
                parishService.getGroupAttendance(user, groupId, attendanceDate);
                
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/attendance/dates")
    public ResponseEntity<List<LocalDate>> getParishAttendanceDates(
            @AuthenticationPrincipal User user) {
        
        List<LocalDate> dates = parishService.getParishAttendanceDates(user);
        return ResponseEntity.ok(dates);
    }
    
    @GetMapping("/attendance/summary")
    public ResponseEntity<List<ParishDto.SummaryResponse>> getParishAttendanceSummary(
            @AuthenticationPrincipal User user,
            @RequestParam("date") String date) {

        LocalDate attendanceDate = LocalDate.parse(date);
        List<ParishDto.SummaryResponse> summary = parishService.getAttendanceSummary(user, attendanceDate);
        return ResponseEntity.ok(summary);
    }
}