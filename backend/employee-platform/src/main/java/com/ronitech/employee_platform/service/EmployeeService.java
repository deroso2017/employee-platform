package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.EmployeeResponse;
import com.ronitech.employee_platform.entity.Employee;
import com.ronitech.employee_platform.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository repository;

    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    // public List<Employee> findAll() {
    // return repository.findAll();
    // }

    public List<EmployeeResponse> findAll() {

        return repository.findAll()
                .stream()
                .map(EmployeeMapper::toResponse)
                .toList();

    }
}
