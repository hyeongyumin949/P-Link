package com.min.ca.reservation;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.min.ca.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final BookingRepository bookingRepository;
    private final ReservationPlaceRepository placeRepository;

    /**
     * 1. [신규] 'ReservationNew.js'의 배너(예약 개수) 확인용
     * (특정 날짜에 사용자가 예약한 '목록' 조회)
     */
    @Transactional(readOnly = true)
    public List<ReservationDto.MyBookingResponse> getMyBookingsOnDate(User user, LocalDate date) {
        List<Booking> bookings = bookingRepository.findAllByUserAndBookingDate(user, date);
        return bookings.stream()
                .map(ReservationDto.MyBookingResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * 2. [수정] '내 예약 확인' 페이지용 (오늘 이후의 모든 예약 목록 조회)
     */
    @Transactional(readOnly = true)
    public List<ReservationDto.MyBookingResponse> getMyBookings(User user) {
        LocalDate today = LocalDate.now();
        
        // [수정] 정렬 기준에 TimeAsc (시간순) 추가
        List<Booking> bookings = bookingRepository
            .findAllByUserAndBookingDateGreaterThanEqualOrderByBookingDateAscBookingTimeAsc(user, today);
        
        return bookings.stream()
                .map(ReservationDto.MyBookingResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * 3. [수정] 신규 예약 생성 (날짜 파라미터 및 2개 제한 로직 적용)
     */
    @Transactional
    public void createBooking(User user, ReservationDto.CreateRequest request) {
        // [수정] '오늘' 대신 DTO에서 '선택한 날짜'를 가져옴
        LocalDate bookingDate = LocalDate.parse(request.getDate());

        // 1. (요구사항) 속장(2), 예비속장(3)은 '하루 2개'만 예약 가능
        if (user.getRole() == 2 || user.getRole() == 3) {
            // [수정] 1개 -> 2개 제한 로직
            int count = bookingRepository.countByUserAndBookingDate(user, bookingDate);
            if (count >= 2) { 
                throw new AccessDeniedException("예약은 하루에 2시간까지만 가능합니다."); // 403
            }
        }
        
        ReservationPlace place = placeRepository.findById(request.getPlaceId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 장소입니다.")); // 404

        // 2. (동시성 제어) [수정] 'bookingDate' 기준으로 검사
        if (bookingRepository.existsByPlaceAndBookingDateAndBookingTime(place, bookingDate, request.getTime())) {
            throw new IllegalStateException("이미 예약된 시간입니다. 다른 시간을 선택해주세요."); // 409
        }

        // 3. 예약 생성
        Booking booking = Booking.builder()
                .user(user)
                .group(user.getGroup())
                .place(place)
                .bookingDate(bookingDate) // 👈 [수정] DTO에서 받은 날짜
                .bookingTime(request.getTime())
                .reason(request.getReason())
                .build();
        
        bookingRepository.save(booking);
    }

    /**
     * 4. [수정] '내 예약' 취소 (날짜 제한 로직 제거)
     */
    @Transactional
    public void cancelBooking(User user, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예약입니다."));

        // 1. (보안) 본인의 예약이 맞는지 확인 (변경 없음)
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("본인의 예약만 취소할 수 있습니다.");
        }
        
        // 2. [삭제] 오늘 날짜인지 확인하는 로직 제거 (미래의 예약도 취소 가능해야 함)
        // if (!booking.getBookingDate().equals(LocalDate.now())) { ... }

        bookingRepository.delete(booking);
    }
}