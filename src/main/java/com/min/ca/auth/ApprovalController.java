package com.min.ca.auth;

import com.min.ca.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/approvals")
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping
    public ResponseEntity<List<ApprovalDto.PendingUserResponse>> getPendingUsers(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(approvalService.getPendingUsers(user));
    }

    @PutMapping("/{userId}/approve")
    public ResponseEntity<?> approveUser(@AuthenticationPrincipal User user, @PathVariable("userId") Long userId) {
        approvalService.approveUser(user, userId);
        return ResponseEntity.ok("승인되었습니다.");
    }

    @DeleteMapping("/{userId}/reject")
    public ResponseEntity<?> rejectUser(@AuthenticationPrincipal User user, @PathVariable("userId") Long userId) {
        approvalService.rejectUser(user, userId);
        return ResponseEntity.ok("거절(삭제)되었습니다.");
    }
}