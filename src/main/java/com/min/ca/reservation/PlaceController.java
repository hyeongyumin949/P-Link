package com.min.ca.reservation;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.min.ca.user.User;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/places")
public class PlaceController {

    private final PlaceService placeService;

    /**
     * Panel 1: 장소 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<PlaceDto.Response>> getAllPlaces() {
        List<PlaceDto.Response> places = placeService.getAllPlaces();
        return ResponseEntity.ok(places);
    }

    /**
     * Panel 2: 시간 슬롯 조회
     */
    @GetMapping("/{id}/slots")
    public ResponseEntity<List<PlaceDto.SlotResponse>> getPlaceTimeSlots(
            @PathVariable("id") Long placeId,
            @RequestParam("date") String date,
            @AuthenticationPrincipal User user // 4. [신규] 현재 로그인한 유저
    ) {
        LocalDate bookingDate = LocalDate.parse(date);
        // 5. [수정] service에 user 전달
        List<PlaceDto.SlotResponse> slots = placeService.getPlaceTimeSlots(placeId, bookingDate, user);
        return ResponseEntity.ok(slots);
    }
}