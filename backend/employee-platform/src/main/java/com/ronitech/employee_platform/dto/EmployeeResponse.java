package com.ronitech.employee_platform.dto;

import java.math.BigDecimal;

public record EmployeeResponse(

        Long id,
        String firstName,
        String lastName,
        String email,
        String position,
        BigDecimal salary,
        Long departmentId,
        String departmentName

) {}