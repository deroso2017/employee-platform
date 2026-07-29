package com.ronitech.employee_platform.dto;

public record TaskResponse(

        Long id,
        String title,
        String description,
        String priority,
        String status,
        Long assignedEmployeeId,
        String assignedEmployeeName

) {}
