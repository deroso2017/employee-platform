package com.ronitech.employee_platform.dto.auth;

import com.ronitech.employee_platform.entity.Role;

import jakarta.validation.constraints.NotNull;

public record ChangeRoleRequest(

        @NotNull Role role

) {
}