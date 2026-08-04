package com.ronitech.employee_platform.dto;

public record LoginResponse(

                String accessToken,
                String refreshToken

) {
}