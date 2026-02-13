package com.min.ca.reservation;

import com.min.ca.group.ChurchGroup;
import com.min.ca.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "BOOKING")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long id;

    // 예약자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 예약 그룹
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private ChurchGroup group;

    // 예약 장소
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id", nullable = false)
    private ReservationPlace place;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "booking_time", nullable = false, length = 10) // "10:00"
    private String bookingTime;

    @Column(nullable = false, length = 500)
    private String reason; // 모임 내용 (사유)

    @Builder
    public Booking(User user, ChurchGroup group, ReservationPlace place, 
                   LocalDate bookingDate, String bookingTime, String reason) {
        this.user = user;
        this.group = group;
        this.place = place;
        this.bookingDate = bookingDate;
        this.bookingTime = bookingTime;
        this.reason = reason;
    }
}