package com.min.ca.reservation;

import com.min.ca.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reservation")
public class ReservationController {

    private final ReservationService reservationService;

    /**
     * 1. [신규] 'ReservationNew.js'의 배너(예약 개수) 확인용
     * (특정 날짜에 사용자가 예약한 '목록' 조회)
     */
    @GetMapping("/my-bookings-on-date")
    public ResponseEntity<List<ReservationDto.MyBookingResponse>> getMyBookingsOnDate(
            @AuthenticationPrincipal User user,
            @RequestParam("date") String date) {
        
        LocalDate bookingDate = LocalDate.parse(date);
        List<ReservationDto.MyBookingResponse> bookings = 
            reservationService.getMyBookingsOnDate(user, bookingDate);
        return ResponseEntity.ok(bookings);
    }
    
    /**
     * 2. [수정] '내 예약 확인' 페이지용 (오늘 이후의 모든 예약 목록 조회)
     */
    @GetMapping("/my-bookings") // 👈 [수정] 경로 복수형
    public ResponseEntity<List<ReservationDto.MyBookingResponse>> getMyBookings( // 👈 [수정] List 반환
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reservationService.getMyBookings(user));
    }

    /**
     * 3. [수정] 신규 예약 생성 (DTO가 변경되었지만 컨트롤러 서명은 동일)
     */
    @PostMapping
    public ResponseEntity<Void> createBooking(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ReservationDto.CreateRequest request) {
        
        reservationService.createBooking(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * 4. [변경없음] '내 예약' 취소
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(
            @AuthenticationPrincipal User user,
            @PathVariable("id") Long bookingId) {
        
        reservationService.cancelBooking(user, bookingId);
        return ResponseEntity.ok().build();
    }
}