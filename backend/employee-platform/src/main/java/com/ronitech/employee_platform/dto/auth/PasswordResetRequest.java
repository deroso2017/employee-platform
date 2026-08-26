package com.ronitech.employee_platform.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record PasswordResetRequest(

        @NotBlank String token,

        @NotBlank String newPassword

) {
}
