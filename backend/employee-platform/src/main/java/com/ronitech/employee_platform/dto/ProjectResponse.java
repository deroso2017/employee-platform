package com.ronitech.employee_platform.dto;

import java.time.LocalDate;

public record ProjectResponse(

        Long id,
        String name,
        String status,
        LocalDate deadline

) {}
