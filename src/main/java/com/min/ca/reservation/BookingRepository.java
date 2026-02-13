package com.min.ca.reservation;

import com.min.ca.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // 1. [신규] Query import
import org.springframework.data.repository.query.Param; // 2. [신규] Param import
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * 1. 특정 날짜에 사용자가 몇 건 예약했는지 '개수'를 확인 (2개 제한용)
     */
    int countByUserAndBookingDate(User user, LocalDate date);

    /**
     * 2. [수정] 특정 장소/날짜 예약 현황 (시간표 로드용)
     * (N+1 문제 해결을 위해 JPQL로 변경: user, group, parent를 Eager Fetching)
     */
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.user " +
           "JOIN FETCH b.group g " +
           "LEFT JOIN FETCH g.parent " + // 3. [신규] 'parent'(교구)도 즉시 로딩
           "WHERE b.place = :place AND b.bookingDate = :date")
    List<Booking> findAllByPlaceAndBookingDateWithDetails(@Param("place") ReservationPlace place, @Param("date") LocalDate date);

    /**
     * 3. 특정 장소/날짜/시간에 예약이 '존재'하는지 확인 (동시성 제어용)
     */
    boolean existsByPlaceAndBookingDateAndBookingTime(ReservationPlace place, LocalDate date, String time);

    /**
     * 4. 'ReservationNew.js'의 배너 확인용
     * (특정 날짜에 사용자가 예약한 '목록' 조회)
     */
    List<Booking> findAllByUserAndBookingDate(User user, LocalDate date);

    /**
     * 5. '내 예약 확인' 페이지용 (오늘 이후의 모든 예약을 날짜순, 시간순으로 정렬)
     */
    List<Booking> findAllByUserAndBookingDateGreaterThanEqualOrderByBookingDateAscBookingTimeAsc(User user, LocalDate date);
}