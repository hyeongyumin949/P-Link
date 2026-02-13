package com.min.ca.attendance; // (패키지 경로는 예시입니다)

import java.util.List;

import com.min.ca.member.Member;

import lombok.Getter;
import lombok.Setter;

public class AttendanceDto {

	@Getter
    @Setter
    public static class DayAttendanceResponse {
        // "스냅샷이 저장되어 있었는지" 여부
        private boolean isSnapshotLoaded; 
        
        // 출결 기록 목록
        private List<LoadResponse> records;
    }
	
    @Getter
    @Setter
    public static class SaveRequest {
        
        // 🔑 출결 날짜 (예: "2025-10-31")
        private String date; 
        
        // 🔑 그날의 모든 학생 기록
        private List<AttendanceRecordDto> records; 
    }

    /**
     * 개별 학생의 출결 기록
     */
    @Getter
    @Setter
    public static class AttendanceRecordDto {
        
        private Long memberId;      // 🔑 학생 ID
        private String status;      // 🔑 "Present" or "Absent"
        private String reason;      // 🔑 결석 사유
        private String note;        // 🔑 비고 (보고 사항)
        
        // 🔑 "달란트 등록하기" 모달로 계산된 "추가할" 달란트 점수
        //
        private int talent; 
    }
    
    @Getter
    @Setter
    public static class LoadResponse {
        // --- Member 정보 ---
        private Long id; // Member ID
        private String name;
        private int totalTalent; // Member의 '누적' 달란트 (참고용)
        
        // --- Attendance 정보 (스냅샷) ---
        private String attendance; // status
        private String reason;
        private String note;
        private int talent; // 👈 "오늘 획득한" 달란트 (항상 0)

        // 생성자 (Member + Attendance -> DTO)
        public LoadResponse(Member member, Attendance attendance) {
            this.id = member.getId();
            this.name = member.getName();
            this.totalTalent = member.getTalent();
            
            if (attendance != null) {
                // 스냅샷이 있으면
                this.attendance = attendance.getStatus();
                this.reason = attendance.getReason();
                this.note = attendance.getNote();
                this.talent = attendance.getTalent();
            } else {
                // 스냅샷이 없으면 (결석 처리)
                this.attendance = "Absent";
                this.reason = "";
                this.note = "";
                this.talent = 0; 
            }
        }
    }
}