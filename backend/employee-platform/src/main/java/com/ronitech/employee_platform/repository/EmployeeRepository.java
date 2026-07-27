package com.ronitech.employee_platform.repository;

import com.ronitech.employee_platform.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository
        extends JpaRepository<Employee, Long> {

}
