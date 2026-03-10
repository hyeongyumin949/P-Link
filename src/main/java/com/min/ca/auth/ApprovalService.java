package com.min.ca.auth;

import com.min.ca.user.User;
import com.min.ca.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final UserRepository userRepository;

    // 1. 승인 대기 목록 조회
    @Transactional(readOnly = true)
    public List<ApprovalDto.PendingUserResponse> getPendingUsers(User currentUser) {
        List<User> pendingUsers = new ArrayList<>();

        if (currentUser.getRole() == 0) {
            // Role 0: 대기 중인 교구장(Role 1) 조회
            pendingUsers = userRepository.findAllByIsActiveFalseAndRole(1);
        } else if (currentUser.getRole() == 1) {
            // Role 1: 본인 교구 소속의 대기 중인 속장(Role 2) 조회
            pendingUsers = userRepository.findAllByIsActiveFalseAndRoleAndGroup_Parent_Id(2, currentUser.getGroup().getId());
        } else {
            throw new AccessDeniedException("승인 권한이 없습니다.");
        }

        return pendingUsers.stream().map(ApprovalDto.PendingUserResponse::new).collect(Collectors.toList());
    }

    // 2. 가입 승인 처리
    @Transactional
    public void approveUser(User currentUser, Long targetUserId) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 권한 체크 (Role 0 -> Role 1 승인, Role 1 -> Role 2 승인)
        if (currentUser.getRole() == 0 && targetUser.getRole() != 1) {
            throw new AccessDeniedException("잘못된 승인 요청입니다.");
        }
        if (currentUser.getRole() == 1) {
            if (targetUser.getRole() != 2 || !targetUser.getGroup().getParent().getId().equals(currentUser.getGroup().getId())) {
                throw new AccessDeniedException("본인 교구의 속장만 승인할 수 있습니다.");
            }
        }

        targetUser.setActive(true); // 🔑 승인 완료!
    }

    // 3. 가입 거절 처리 (데이터 삭제)
    @Transactional
    public void rejectUser(User currentUser, Long targetUserId) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        // (승인 로직과 동일하게 권한 체크 생략/추가 가능)
        userRepository.delete(targetUser); // 🔑 거절 시 데이터 삭제
    }
}