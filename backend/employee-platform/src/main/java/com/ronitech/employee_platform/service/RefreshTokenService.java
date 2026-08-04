package com.ronitech.employee_platform.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ronitech.employee_platform.entity.RefreshToken;
import com.ronitech.employee_platform.entity.User;
import com.ronitech.employee_platform.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository repository;

    @Value("${refresh.expiration}")
    private long expiration;

    public RefreshToken create(User user) {

        RefreshToken token = new RefreshToken();

        token.setToken(UUID.randomUUID().toString());
        token.setExpiresAt(
                Instant.now().plusMillis(expiration));
        token.setUser(user);
        token.setRevoked(false);

        return repository.save(token);

    }

    public RefreshToken validate(String token) {

        RefreshToken refreshToken = repository
                .findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (refreshToken.isRevoked()) {
            throw new RuntimeException("Refresh token revoked");
        }

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Refresh token expired");
        }

        return refreshToken;

    }

    public RefreshToken rotate(RefreshToken oldToken) {

        oldToken.setRevoked(true);

        repository.save(oldToken);

        return create(oldToken.getUser());
    }

    public void revoke(RefreshToken token) {

        token.setRevoked(true);

        repository.save(token);
    }

}
