package com.min.ca.member;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 🔑 중요

import com.min.ca.group.ChurchGroup;
import com.min.ca.group.ChurchGroupRepository;
import com.min.ca.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // 🔑 final 필드 생성자 자동 주입
public class MemberService {

    private final MemberRepository memberRepository;
    private final ChurchGroupRepository groupRepository; // 🔑 그룹 ID로 그룹 객체를 찾기 위해
    // (USER Repository는 user_id를 Member에 저장해야 할 때 주입 필요)

    // 1. 회원 조회 (로그인한 유저의 group_id 기준)
    @Transactional(readOnly = true)
    public List<MemberDto.Response> getMembersByGroupId(Long groupId) {
        // 1. Repository를 통해 DB에서 엔티티 목록 조회
        List<Member> members = memberRepository.findAllByGroup_Id(groupId);

        // 2. 엔티티 목록(List<Member>)을 DTO 목록(List<MemberDto.Response>)으로 변환
        return members.stream()
                .map(member -> new MemberDto.Response(member)) // 🔑 엔티티 -> DTO 변환
                .collect(Collectors.toList());
    }

    // 2. 회원 추가
    @Transactional
    // 🔑 파라미터에 User user 추가
    public MemberDto.Response addMember(MemberDto.CreateRequest request, Long groupId, User user) {
        
        // 1. groupId로 실제 ChurchGroup 엔티티를 조회
        ChurchGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("해당 그룹을 찾을 수 없습니다. id=" + groupId));

        // 2. DTO, group, user 객체를 기반으로 새 Member 엔티티 생성
        Member newMember = Member.builder()
                .name(request.getName())
                .contact(request.getContact())
                .group(group) 
                .user(user) // 👈 [해결] 로그인한 사용자를 Member에 연결
                .isActive(true)
                .talent(0)
                .build();

        // 3. Repository를 통해 DB에 저장
        Member savedMember = memberRepository.save(newMember);

        // 4. 저장된 엔티티를 DTO로 변환하여 Controller에 반환
        return new MemberDto.Response(savedMember);
    }

    // 3. 회원 수정
    @Transactional
    public MemberDto.Response updateMember(Long memberId, MemberDto.UpdateRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("해당 회원을 찾을 수 없습니다. id=" + memberId));

        // DTO의 내용으로 엔티티 필드 값 변경
        member.setName(request.getName());
        member.setContact(request.getContact());

        // 🔑 [추가] talent 값이 DTO에 포함되어 넘어온 경우에만 업데이트
        if (request.getTalent() != null) {
            member.setTalent(request.getTalent());
        }
        
        return new MemberDto.Response(member);
    }
    // 4. 회원 삭제 (Soft Delete)
    @Transactional
    public void deleteMember(Long memberId) {
        // 1. 삭제할 Member 엔티티 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("해당 회원을 찾을 수 없습니다. id=" + memberId));

        // 2. isActive 플래그 변경
        member.setActive(false); // 🔑 (Member 엔티티에 setter가 있어야 함)

        // 3. @Transactional 종료 시 UPDATE 쿼리 자동 실행
    }
}