package com.ronitech.employee_platform.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record ProjectRequest(

        @NotBlank(message = "Name is required")
        String name,

        String status,
        LocalDate deadline

) {}
