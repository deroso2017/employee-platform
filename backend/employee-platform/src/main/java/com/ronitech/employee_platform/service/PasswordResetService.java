package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.entity.PasswordResetToken;
import com.ronitech.employee_platform.entity.User;
import com.ronitech.employee_platform.repository.PasswordResetTokenRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordResetTokenService tokenService;
    private final long expirationMinutes;

    public PasswordResetService(
            PasswordResetTokenRepository tokenRepository,
            PasswordResetTokenService tokenService,
            @Value("${password-reset.expiration-minutes:30}") long expirationMinutes) {

        this.tokenRepository = tokenRepository;
        this.tokenService = tokenService;
        this.expirationMinutes = expirationMinutes;
    }

    @Transactional
    public String createToken(User user) {

        tokenRepository.deleteByUser(user);

        String rawToken = tokenService.generateToken();

        String tokenHash = tokenService.hashToken(rawToken);

        Instant expiresAt = Instant.now().plus(
                Duration.ofMinutes(
                        expirationMinutes));

        PasswordResetToken resetToken = new PasswordResetToken(
                user,
                tokenHash,
                expiresAt);

        tokenRepository.save(resetToken);

        return rawToken;
    }

    @Transactional
    public PasswordResetToken validateToken(
            String rawToken) {

        String tokenHash = tokenService.hashToken(rawToken);

        PasswordResetToken resetToken = tokenRepository
                .findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid password reset token"));

        if (resetToken.isUsed()) {

            throw new IllegalArgumentException(
                    "Password reset token has already been used");
        }

        if (resetToken.isExpired()) {

            throw new IllegalArgumentException(
                    "Password reset token has expired");
        }

        return resetToken;
    }
}