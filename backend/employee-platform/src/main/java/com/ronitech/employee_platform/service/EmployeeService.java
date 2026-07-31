package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.EmployeeRequest;
import com.ronitech.employee_platform.dto.EmployeeResponse;
import com.ronitech.employee_platform.entity.Department;
import com.ronitech.employee_platform.entity.Employee;
import com.ronitech.employee_platform.exception.EmployeeNotFoundException;
import com.ronitech.employee_platform.mapper.EmployeeMapper;
import com.ronitech.employee_platform.repository.DepartmentRepository;
import com.ronitech.employee_platform.repository.EmployeeRepository;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeMapper mapper;

    public EmployeeService(EmployeeRepository employeeRepository, DepartmentRepository departmentRepository,
            EmployeeMapper mapper) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.mapper = mapper;
    }

    // Old approach:
    // This returns the database Entity directly to the Controller.
    // public List<Employee> findAll() {
    // return repository.findAll();
    // }

    public Page<EmployeeResponse> findAll(
            Pageable pageable) {

        return employeeRepository.findAll(pageable)
                .map(mapper::toResponse);

    }

    public EmployeeResponse findById(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));

        return mapper.toResponse(employee);

    }

    public EmployeeResponse create(EmployeeRequest request) {

        Employee employee = mapper.toEntity(request);

        Employee savedEmployee = employeeRepository.save(employee);

        return mapper.toResponse(savedEmployee);

    }

    @Transactional
    public EmployeeResponse update(
            Long id,
            EmployeeRequest request) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));

        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setEmail(request.email());

        return mapper.toResponse(employee);

    }

    public void delete(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));

        employeeRepository.delete(employee);

    }

    public Page<EmployeeResponse> search(String name, Pageable pageable) {

        return employeeRepository
                .findByFirstNameContainingIgnoreCase(
                        name,
                        pageable)
                .map(mapper::toResponse);

    }

    public EmployeeResponse assignDepartment(
            Long employeeId,
            Long departmentId) {

        Employee employee = employeeRepository
                .findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

        Department department = departmentRepository
                .findById(departmentId)
                .orElseThrow();

        employee.setDepartment(department);

        return mapper.toResponse(
                employeeRepository.save(employee));
    }

}