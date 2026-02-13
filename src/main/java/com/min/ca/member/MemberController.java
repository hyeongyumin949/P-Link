package com.min.ca.member;

import com.min.ca.user.User; // 🔑 현재 로그인한 사용자 정보를 받기 위해
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // 🔑 핵심
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/members") // 🔑 이 컨트롤러의 기본 API 주소
public class MemberController {

    private final MemberService memberService;

    /**
     * 1. 회원 조회 (GET /api/members)
     * - @AuthenticationPrincipal: Spring Security가 JWT 토큰을 분석하여,
     * 현재 로그인한 사용자의 'User' 객체를 'userDetails' 파라미터에 자동 주입해줍니다.
     */
    @GetMapping
    public ResponseEntity<List<MemberDto.Response>> getMyMembers(
            @AuthenticationPrincipal User userDetails) {
        
        // 1. 로그인한 유저의 'group_id'를 가져옵니다.
        Long groupId = userDetails.getGroup().getId();
        
        // 2. Service를 호출하여 해당 그룹의 회원 목록을 받습니다.
        List<MemberDto.Response> members = memberService.getMembersByGroupId(groupId);
        
        return ResponseEntity.ok(members);
    }

    /**
     * 2. 회원 추가 (POST /api/members)
     */
    @PostMapping
    public ResponseEntity<MemberDto.Response> createMember(
            @AuthenticationPrincipal User userDetails,
            @RequestBody MemberDto.CreateRequest request) { 
        
        Long groupId = userDetails.getGroup().getId();
        
        // 2. Service를 호출하여 회원을 추가합니다.
        // 🔑 userDetails 객체를 서비스로 전달
        MemberDto.Response newMember = memberService.addMember(request, groupId, userDetails);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(newMember);
    }

    /**
     * 3. 회원 수정 (PUT /api/members/{memberId})
     */
    @PutMapping("/{memberId}")
    public ResponseEntity<MemberDto.Response> updateMember(
            // 🔑 URL 경로의 "memberId"를 이 파라미터에 주입하라고 명시
            @PathVariable("memberId") Long memberId, 
            @RequestBody MemberDto.UpdateRequest request) {
        
        MemberDto.Response updatedMember = memberService.updateMember(memberId, request);
        return ResponseEntity.ok(updatedMember);
    }

    /**
     * 4. 회원 삭제 (DELETE /api/members/{memberId})
     */
    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> deleteMember(
            // 🔑 URL 경로의 "memberId"를 이 파라미터에 주입하라고 명시
            @PathVariable("memberId") Long memberId) { 
        
        memberService.deleteMember(memberId);
        return ResponseEntity.ok().build();
    }
}