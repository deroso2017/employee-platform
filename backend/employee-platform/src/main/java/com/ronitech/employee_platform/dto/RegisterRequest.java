package com.ronitech.employee_platform.dto;

import com.ronitech.employee_platform.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(

        @Email String email,

        @NotBlank String password,

        Role role

) {
}