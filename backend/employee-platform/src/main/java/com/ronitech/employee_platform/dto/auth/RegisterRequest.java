package com.ronitech.employee_platform.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @Email String email,

        @NotBlank @Size(min = 8) String password

) {
}