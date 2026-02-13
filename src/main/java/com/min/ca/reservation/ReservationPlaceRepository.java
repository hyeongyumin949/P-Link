package com.min.ca.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationPlaceRepository extends JpaRepository<ReservationPlace, Long> {
    
    // Panel 1: 활성화된 장소 목록 조회
    List<ReservationPlace> findAllByIsActive(boolean isActive);
}