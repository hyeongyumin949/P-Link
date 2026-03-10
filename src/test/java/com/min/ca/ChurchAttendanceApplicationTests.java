	package com.min.ca;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import com.min.ca.group.ChurchGroup;
import com.min.ca.group.ChurchGroupRepository;

@SpringBootTest
class ChurchAttendanceApplicationTests {

    @Autowired
    private ChurchGroupRepository churchGroupRepository;

    @Test
    @DisplayName("교회 초기 조직도(교구 및 속) 데이터 강제 주입")
    @Transactional
    @Rollback(false) // 핵심: 테스트가 끝나도 롤백하지 않고 DB에 데이터를 실제로 커밋합니다.
    public void insertInitialGroups() {
        
        // 데이터 중복 삽입 방지를 위해 테이블이 비어있을 때만 실행하게 할 수도 있습니다.
        // if (churchGroupRepository.count() > 0) return;

        // 1. 남선교회 1, 2교구 (각 3개 속)
        createParishAndGroups("남선교회 1교구", 3);
        createParishAndGroups("남선교회 2교구", 3);

        // 2. 여선교회 1, 2교구 (각 3개 속)
        createParishAndGroups("여선교회 1교구", 3);
        createParishAndGroups("여선교회 2교구", 3);

        // 3. 아동 1, 2, 3목장 (각 3개 속)
        createParishAndGroups("아동 1목장", 3);
        createParishAndGroups("아동 2목장", 3);
        createParishAndGroups("아동 3목장", 3);

        // 4. 청년회 (3개 속)
        createParishAndGroups("청년회", 3);

        System.out.println("초기 그룹 데이터 주입이 완료되었습니다!");
    }

    /**
     * 부모 그룹(교구/목장)을 생성하고, 지정된 개수만큼 자식 그룹(속)을 생성하는 헬퍼 메서드
     */
    private void createParishAndGroups(String parishName, int groupCount) {
        // 1. 부모 그룹(교구) 생성
        ChurchGroup parish = ChurchGroup.builder()
                .name(parishName)
                .parent(null) // 최상위 그룹이므로 parent는 null
                .build();
        
        ChurchGroup savedParish = churchGroupRepository.save(parish);

        // 2. 자식 그룹(속) 생성
        for (int i = 1; i <= groupCount; i++) {
            ChurchGroup group = ChurchGroup.builder()
                    .name(i + "속")
                    .parent(savedParish) // 방금 만든 교구를 부모로 지정
                    .build();
            
            churchGroupRepository.save(group);
        }
    }
}