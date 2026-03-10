package com.min.ca.user;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.min.ca.group.ChurchGroup;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    List<User> findAllByGroupInAndRole(List<ChurchGroup> groups, int role);
    
    List<User> findAllByIsActiveFalseAndRole(int role);
    List<User> findAllByIsActiveFalseAndRoleAndGroup_Parent_Id(int role, Long parentId);
}