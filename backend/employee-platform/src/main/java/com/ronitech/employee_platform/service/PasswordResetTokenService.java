package com.ronitech.employee_platform.service;

import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

@Service
public class PasswordResetTokenService {

    private final SecureRandom secureRandom = new SecureRandom();

    public String generateToken() {

        byte[] bytes = new byte[32];

        secureRandom.nextBytes(bytes);

        return HexFormat.of().formatHex(bytes);
    }

    public String hashToken(String token) {

        try {

            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(
                            java.nio.charset.StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException exception) {

            throw new IllegalStateException(
                    "SHA-256 algorithm not available",
                    exception);
        }
    }
}