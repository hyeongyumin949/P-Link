package com.min.ca;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit; // 👈 1. [중요] Commit 임포트
import org.springframework.transaction.annotation.Transactional; // 👈 2. [중요] Transactional 임포트

import com.min.ca.reservation.ReservationPlace;
import com.min.ca.reservation.ReservationPlaceRepository;

import java.util.List;

@SpringBootTest
class ChurchAttendanceApplicationTests {

    // 3. 장소 리포지토리 주입
    @Autowired
    private ReservationPlaceRepository reservationPlaceRepository;

    /**
     * 4. [신규] 장소 데이터 주입 테스트
     * - @Transactional: 이 메서드를 하나의 트랜잭션으로 묶습니다.
     * - @Commit: 테스트가 성공하면 트랜잭션을 '커밋'하도록 강제합니다. (롤백 방지)
     */
    @Test
    @Transactional
    @Commit
    void injectReservationPlaces() {
        System.out.println("--- 장소 데이터 주입 시작 ---");

        // 5. ReservationPlace.java의 @Builder 사용 [cite: 7]
        ReservationPlace place1 = ReservationPlace.builder()
                .name("카페 (카운터)")
                .description("카페입니다.")
                .isActive(true)
                .build();

        ReservationPlace place2 = ReservationPlace.builder()
                .name("카페 (정수기)")
                .description("카페입니다.")
                .isActive(true)
                .build();

        ReservationPlace place3 = ReservationPlace.builder()
                .name("교육관")
                .description("주방과 이어져 있어 왕래가 있습니다.")
                .isActive(true)
                .build();
        
        ReservationPlace place4 = ReservationPlace.builder()
                .name("아동2교구 예배실")
                .description("예배실이오니 깨끗하게 사용해주세요.")
                .isActive(true)
                .build();

        ReservationPlace place5 = ReservationPlace.builder()
                .name("아동1교구 예배실")
                .description("예배실이오니 깨끗하게 사용해주세요.")
                .isActive(true)
                .build();

        // 6. 리스트로 묶어서 한번에 저장
        reservationPlaceRepository.saveAll(List.of(
            place1, place2, place3, place4, place5
        ));

        System.out.println("--- 5개의 장소 데이터 주입 완료 ---");
    }

    // (기존 contextLoads() 테스트는 그대로 두셔도 됩니다)
    @Test
    void contextLoads() {
    }
}