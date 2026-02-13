package com.min.ca.reservation;

import org.antlr.v4.runtime.misc.NotNull;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

public class ReservationDto {

    /**
     * 0. 예약 상태 확인 응답
     * GET /api/reservation/status
     */
    @Getter
    public static class StatusResponse {
        private boolean isBooked;
        
        public StatusResponse(boolean isBooked) {
            this.isBooked = isBooked;
        }
    }

    /**
     * 3-1. 예약 생성 요청
     * POST /api/reservation
     */
    @Getter
    @Setter
    public static class CreateRequest {
        @NotNull
        private Long placeId;

        @NotEmpty
        private String time; // "10:00"

        @NotEmpty
        private String reason;
        
        @NotEmpty 
        private String date; // "2025-11-05"
    }

    /**
     * '내 예약' 확인 응답
     * GET /api/reservation/my-booking
     */
    @Getter
    public static class MyBookingResponse {
        private Long id;
        private String placeName;
        private String date; // "2025-11-04"
        private String time; // "10:00"
        private String reason;

        public MyBookingResponse(Booking booking) {
            this.id = booking.getId();
            this.placeName = booking.getPlace().getName();
            this.date = booking.getBookingDate().toString();
            this.time = booking.getBookingTime();
            this.reason = booking.getReason();
        }
    }
}