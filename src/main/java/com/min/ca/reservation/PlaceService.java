package com.min.ca.reservation;

import com.min.ca.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceService {

    private final ReservationPlaceRepository placeRepository;
    private final BookingRepository bookingRepository;

    // (1시간 단위 시간표)
    private static final List<String> AVAILABLE_TIMES = Stream.of(
            "09:00", "10:00", "11:00", "12:00", "13:00", 
            "14:00", "15:00", "16:00", "17:00"
    ).collect(Collectors.toList());

    /**
     * Panel 1: 활성화된 장소 목록 전체 조회 (변경 없음)
     */
    public List<PlaceDto.Response> getAllPlaces() {
        List<ReservationPlace> placesFromDB = placeRepository.findAllByIsActive(true);
        
        // (디버깅 코드였던 System.out.println은 제거하셔도 됩니다)
        
        return placesFromDB.stream()
                .map(PlaceDto.Response::new)
                .collect(Collectors.toList());
    }

    /**
     * Panel 2: 시간대별 예약 현황 조회 (3-Status)
     * (currentUser 파라미터 및 리포지토리 호출 수정)
     */
    public List<PlaceDto.SlotResponse> getPlaceTimeSlots(Long placeId, LocalDate date, User currentUser) {
        
        ReservationPlace place = placeRepository.findById(placeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 장소입니다."));

        // 1. [수정] 수정한 리포지토리 메서드 호출 (Join Fetch 실행)
        List<Booking> bookings = bookingRepository.findAllByPlaceAndBookingDateWithDetails(place, date);

        Map<String, Booking> bookingMap = bookings.stream()
                .collect(Collectors.toMap(Booking::getBookingTime, booking -> booking));

        return AVAILABLE_TIMES.stream()
            .map(time -> {
                Booking booking = bookingMap.get(time);
                if (booking != null) {
                    // 2. [수정] 예약된 슬롯 (currentUser 정보 전달)
                    return new PlaceDto.SlotResponse(time, booking, currentUser);
                } else {
                    // 3. 예약 가능 슬롯
                    return new PlaceDto.SlotResponse(time);
                }
            })
            .collect(Collectors.toList());
    }
}