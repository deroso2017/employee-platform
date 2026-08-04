package com.ronitech.employee_platform.dto.auth;

public record LoginResponse(

        String accessToken,
        String refreshToken

) {
}