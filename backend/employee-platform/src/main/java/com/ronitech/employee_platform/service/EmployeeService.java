package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.EmployeeRequest;
import com.ronitech.employee_platform.dto.EmployeeResponse;
import com.ronitech.employee_platform.entity.Employee;
import com.ronitech.employee_platform.exception.EmployeeNotFoundException;
import com.ronitech.employee_platform.mapper.EmployeeMapper;
import com.ronitech.employee_platform.repository.EmployeeRepository;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    public Page<EmployeeResponse> findAll(
            Pageable pageable) {

        return repository.findAll(pageable)
                .map(mapper::toResponse);

    }

    public EmployeeResponse findById(Long id) {

        Employee employee = repository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));

        return mapper.toResponse(employee);

    }

    public EmployeeResponse create(EmployeeRequest request) {

        Employee employee = mapper.toEntity(request);

        Employee savedEmployee = repository.save(employee);

        return mapper.toResponse(savedEmployee);

    }

    @Transactional
    public EmployeeResponse update(
            Long id,
            EmployeeRequest request) {

        Employee employee = repository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));

        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setEmail(request.email());

        return mapper.toResponse(employee);

    }

    public void delete(
            Long id) {

        Employee employee = repository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));

        repository.delete(employee);

    }

    public Page<EmployeeResponse> search(
            String name,
            Pageable pageable) {

        return repository
                .findByFirstNameContainingIgnoreCase(
                        name,
                        pageable)
                .map(mapper::toResponse);

    }

}