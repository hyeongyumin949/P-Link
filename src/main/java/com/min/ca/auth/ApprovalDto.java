package com.min.ca.auth;

import com.min.ca.user.User;
import lombok.Getter;

public class ApprovalDto {
    @Getter
    public static class PendingUserResponse {
        private Long id;
        private String username;
        private String name;
        private String groupName;
        private int role;

        public PendingUserResponse(User user) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.name = user.getName();
            // 최상위 교구인지 하위 속인지에 따라 이름 표시
            this.groupName = (user.getGroup().getParent() != null) 
                ? user.getGroup().getParent().getName() + " - " + user.getGroup().getName() 
                : user.getGroup().getName();
            this.role = user.getRole();
        }
    }
}