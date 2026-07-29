package com.ronitech.employee_platform.dto;

import jakarta.validation.constraints.NotBlank;

public record DepartmentRequest(

        @NotBlank(message = "Name is required")
        String name,

        Long managerId

) {}
