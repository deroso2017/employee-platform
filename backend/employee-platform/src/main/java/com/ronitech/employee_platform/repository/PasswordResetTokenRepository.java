package com.ronitech.employee_platform.repository;

import com.ronitech.employee_platform.entity.PasswordResetToken;
import com.ronitech.employee_platform.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHash(
            String tokenHash);

    void deleteByUser(User user);
}