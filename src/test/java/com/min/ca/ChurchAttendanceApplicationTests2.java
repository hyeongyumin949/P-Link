package com.min.ca;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import com.min.ca.group.ChurchGroup;
import com.min.ca.group.ChurchGroupRepository;
import com.min.ca.user.User;
import com.min.ca.user.UserRepository;

@SpringBootTest
class ChurchAttendanceApplicationTests2 {

	@Autowired
    private UserRepository userRepository;

    @Autowired
    private ChurchGroupRepository churchGroupRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("특정 group_id에 담당 교역자(Role 0) 계정 주입")
    @Transactional
    @Rollback(false)
    public void insertPastorUserById() {
        String pastorEmail = "pastor_child2@church.com";
        
        if (userRepository.findByUsername(pastorEmail).isPresent()) {
            System.out.println("이미 계정이 존재합니다: " + pastorEmail);
            return;
        }

        // 1. DB에서 확인한 '아동 2목장'의 실제 group_id 값 (여기를 수정하세요!)
        Long targetGroupId = 21L; 

        // 2. 이름 대신 확실한 고유 번호(group_id)로 그룹을 찾습니다.
        ChurchGroup targetGroup = churchGroupRepository.findById(targetGroupId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 그룹 ID입니다: " + targetGroupId));

        // 3. 해당 그룹에 교역자(Role 0) 계정 생성
        User pastorUser = User.builder()
                .username(pastorEmail)
                .password(passwordEncoder.encode("pastor1234!"))
                .name("김은미")
                .role(0) // 교역자
                .group(targetGroup) // 🔑 ID로 찾아온 그룹을 바로 꽂아줍니다!
                .isYouth(true)      
                .isActive(true)
                .build();

        userRepository.save(pastorUser);

        System.out.println("✅ " + targetGroup.getName() + " 교역자 계정 생성이 완료되었습니다! (ID: " + pastorEmail + ")");
    }
}