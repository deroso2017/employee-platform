package com.ronitech.employee_platform.event;

public record EmployeeCreatedEvent(
        Long employeeId,
        String firstName,
        String lastName,
        String email) {
}