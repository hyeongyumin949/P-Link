package com.min.ca.parish;

import com.min.ca.attendance.AttendanceDto;
import com.min.ca.group.ChurchGroup;
import com.min.ca.user.User;

import lombok.Getter;

public class ParishDto {

    /**
     * 교구장이 관리하는 '속(sub-group)' 목록 응답 DTO
     */
    @Getter
    public static class GroupResponse {
        private Long groupId;
        private String groupName;
        private String leaderName; // 👈 그 속의 속장(role 2) 이름
        
        public GroupResponse(ChurchGroup group, User leader) {
            this.groupId = group.getId();
            this.groupName = group.getName();
            // 속장이 아직 배정되지 않았을 수 있으므로 null 체크
            this.leaderName = (leader != null) ? leader.getName() : "미배정";
        }
    }
    
    @Getter
    public static class SummaryResponse {
        // --- '속' 그룹 정보 ---
        private Long groupId;
        private String groupName;
        private String leaderName;

        // --- 출결 요약 ---
        private boolean submitted; // 👈 출결 등록 여부 (isSnapshotLoaded)
        private int presentCount;  // 👈 출석 인원
        private int absentCount;   // 👈 결석 인원
        private int totalTalentToday; // 👈 💡 오늘 획득한 총 달란트

        /**
         * @param group '속' ChurchGroup 엔티티
         * @param leader 해당 '속'의 속장 User 엔티티
         * @param groupData (Optional) 해당 속의 출결 상세 데이터
         */
        public SummaryResponse(ChurchGroup group, User leader, AttendanceDto.DayAttendanceResponse groupData) {
            this.groupId = group.getId();
            this.groupName = group.getName();
            this.leaderName = (leader != null) ? leader.getName() : "미배정";

            if (groupData != null && groupData.isSnapshotLoaded()) {
                this.submitted = true;
                
                // 출결 데이터를 순회하며 요약 정보 계산
                for (AttendanceDto.LoadResponse record : groupData.getRecords()) {
                    if ("Present".equals(record.getAttendance())) {
                        this.presentCount++;
                    } else {
                        this.absentCount++;
                    }
                    // (위 1번에서 DTO를 수정했기 때문에 'talent'에 0이 아닌 실제 값이 들어있음)
                    this.totalTalentToday += record.getTalent();
                }
            } else {
                // 스냅샷이 로드되지 않았거나 (미제출), groupData 자체가 null인 경우
                this.submitted = false;
                this.presentCount = 0;
                this.absentCount = 0; // (미제출 시 인원수 대신 0으로 표시)
                this.totalTalentToday = 0;
            }
       }
    }
}