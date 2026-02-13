package com.min.ca.reservation;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.min.ca.group.ChurchGroup; // 1. [신규] ChurchGroup import
import com.min.ca.user.User;
import lombok.Getter;

public class PlaceDto {

    /**
     * Panel 1: 장소 목록 응답
     * (이 DTO는 변경사항 없습니다)
     */
    @Getter
    public static class Response {
        private Long id;
        private String name;
        private String description;

        public Response(ReservationPlace place) {
            this.id = place.getId();
            this.name = place.getName();
            this.description = place.getDescription();
        }
    }

    /**
     * Panel 2: 시간 슬롯 응답
     * (parishName 필드 및 생성자 로직 추가)
     */
    @Getter
    public static class SlotResponse {
        private String time;
        
        // (이전 작업: boolean 대신 status 문자열 사용)
        private String status; // "AVAILABLE", "BOOKED_BY_ME", "BOOKED_BY_OTHER"
        
        // (status != "AVAILABLE" 일 때만 채워짐)
        private String reservedBy;
        private String groupName;   // 👈 "7속"
        private String parishName;  // 👈 2. [신규] "A교구"
        private String reason;

        // 1. 예약 가능 슬롯
        public SlotResponse(String time) {
            this.time = time;
            this.status = "AVAILABLE";
        }

        // 2. [수정] 예약된 슬롯 (currentUser 파라미터 추가)
        public SlotResponse(String time, Booking booking, User currentUser) {
            this.time = time;
            this.reservedBy = booking.getUser().getName();
            this.reason = booking.getReason();
            
            ChurchGroup group = booking.getGroup(); // 👈 "속"
            this.groupName = group.getName();
            
            // 3. [신규] "속"의 부모("교구")가 있으면 이름을 가져옴
            if (group.getParent() != null) {
                this.parishName = group.getParent().getName();
            } else {
                this.parishName = "N/A"; // (교구가 없는 최상위 그룹일 경우)
            }
            
            // 4. [수정] '내 예약'인지 '타인 예약'인지 구분
            if (booking.getUser().getId().equals(currentUser.getId())) {
                this.status = "BOOKED_BY_ME";
            } else {
                this.status = "BOOKED_BY_OTHER";
            }
        }
    }
}