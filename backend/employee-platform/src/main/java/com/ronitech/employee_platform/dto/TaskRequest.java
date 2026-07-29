package com.ronitech.employee_platform.dto;

import jakarta.validation.constraints.NotBlank;

public record TaskRequest(

        @NotBlank(message = "Title is required")
        String title,

        String description,
        String priority,
        String status,
        Long assignedEmployeeId

) {}
