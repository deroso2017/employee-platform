package com.ronitech.employee_platform.dto;

public record EmployeeResponse(

        Long id,
        String firstName,
        String lastName,
        String email,
        String profileImage,
        DepartmentResponse department

) {
}
