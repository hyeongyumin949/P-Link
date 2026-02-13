package com.min.ca.attendance;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.min.ca.user.User;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/attendance") // 🔑 출결 API 기본 주소
public class AttendanceController {

    private final AttendanceService attendanceService;

    /**
     * 1. 출결 저장 (POST /api/attendance)
     * [POST] /api/attendance
     *
     * @param request DTO (날짜 + 학생 기록 리스트)
     * @param user    로그인한 속장(User)
     */
    @PostMapping
    public ResponseEntity<Void> saveAttendance(
            @RequestBody AttendanceDto.SaveRequest request,
            @AuthenticationPrincipal User user) {

        // 1. Service를 호출하여 2-Part 저장 로직 실행
        // (1. Attendance 테이블 저장 + 2. Member 테이블 업데이트)
        attendanceService.saveAttendance(request, user);

        // 2. 성공 응답 (HTTP 200 OK, 본문 없음)
        return ResponseEntity.ok().build();
    }
    
    /**
     * 🔑 [신규] 2. 출결 조회 (GET /api/attendance?date=YYYY-MM-DD)
     */
    @GetMapping
    public ResponseEntity<AttendanceDto.DayAttendanceResponse> getAttendance(
            @RequestParam("date") String date, 
            @AuthenticationPrincipal User user) {
        
        Long groupId = user.getGroup().getId();
        LocalDate attendanceDate = LocalDate.parse(date);

        // 🔑 2. Service가 DayAttendanceResponse 객체를 반환
        AttendanceDto.DayAttendanceResponse response = attendanceService.getAttendance(groupId, attendanceDate);
        
        return ResponseEntity.ok(response); // 👈 이 객체를 반환
    }
    
    @GetMapping("/dates")
    public ResponseEntity<List<LocalDate>> getAttendanceDates(@AuthenticationPrincipal User user) {
        List<LocalDate> dates = attendanceService.getSavedDates(user.getGroup().getId());
        return ResponseEntity.ok(dates); // 👈 ["2025-10-04", "2025-10-22"]
    }
    
    /**
     * 🔑 [신규] 특정 날짜의 출결 기록 삭제
     * (DELETE /api/attendance?date=YYYY-MM-DD)
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteAttendance(
            @AuthenticationPrincipal User user,
            @RequestParam("date") String date) { // 👈 @PathVariable 대신 @RequestParam 사용
        
        LocalDate attendanceDate = LocalDate.parse(date);
        attendanceService.deleteAttendanceByDate(user, attendanceDate);
        
        return ResponseEntity.ok().build(); // 200 OK
    }
}