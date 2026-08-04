package com.ronitech.employee_platform.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(

                @NotBlank String refreshToken

) {
}
