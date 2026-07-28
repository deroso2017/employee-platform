package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.EmployeeRequest;
import com.ronitech.employee_platform.dto.EmployeeResponse;
import com.ronitech.employee_platform.entity.Employee;
import com.ronitech.employee_platform.mapper.EmployeeMapper;
import com.ronitech.employee_platform.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository repository;
    private final EmployeeMapper mapper;

    public EmployeeService(EmployeeRepository repository, EmployeeMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    // Old approach:
    // This returns the database Entity directly to the Controller.
    // public List<Employee> findAll() {
    // return repository.findAll();
    // }

    public List<EmployeeResponse> findAll() {

        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();

    }

    public EmployeeResponse create(EmployeeRequest request) {

        Employee employee = mapper.toEntity(request);

        Employee savedEmployee = repository.save(employee);

        return mapper.toResponse(savedEmployee);

    }
}