package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.EmployeeResponse;
import com.ronitech.employee_platform.entity.Employee;

public class EmployeeMapper {

    public static EmployeeResponse toResponse(Employee employee) {

        return new EmployeeResponse(
                employee.getId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail()
        );

    }

}
