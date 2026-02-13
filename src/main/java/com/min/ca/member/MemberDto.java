package com.min.ca.member;

import lombok.Getter;
import lombok.Setter;

public class MemberDto {

    // 1. 회원 '조회' 시 프론트엔드로 보낼 응답 DTO
    @Getter
    public static class Response {
        private Long id;
        private String name;
        private String contact;
        private boolean isActive;
        private Long groupId;
        private String groupName;
        private int talent;

        // 엔티티를 DTO로 변환하는 생성자
        public Response(Member member) {
            this.id = member.getId();
            this.name = member.getName();
            this.contact = member.getContact();
            this.isActive = member.isActive();
            this.groupId = member.getGroup().getId();
            this.groupName = member.getGroup().getName();
            this.talent = member.getTalent();
        }
    }

    // 2. 회원 '추가' 시 프론트엔드에서 받을 요청 DTO
    @Getter
    @Setter
    public static class CreateRequest {
        private String name;
        private String contact;
        // (groupId는 로그인한 유저 정보에서 가져오므로 DTO에 필요 X)
    }

    // 3. 회원 '수정' 시 프론트엔드에서 받을 요청 DTO
    @Getter
    @Setter
    public static class UpdateRequest {
        private String name;
        private String contact;
        private Integer talent;
    }
}