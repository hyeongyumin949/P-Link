package com.min.ca.reservation;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "RESERVATION_PLACE")
public class ReservationPlace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "place_id")
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String description;
    
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Builder
    public ReservationPlace(String name, String description, boolean isActive) {
        this.name = name;
        this.description = description;
        this.isActive = isActive;
    }
}