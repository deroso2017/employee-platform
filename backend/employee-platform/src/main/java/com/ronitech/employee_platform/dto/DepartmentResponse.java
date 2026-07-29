package com.ronitech.employee_platform.dto;

public record DepartmentResponse(

        Long id,
        String name,
        Long managerId,
        String managerName

) {}
