package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.DepartmentRequest;
import com.ronitech.employee_platform.dto.DepartmentResponse;
import com.ronitech.employee_platform.entity.Department;
import com.ronitech.employee_platform.exception.ResourceNotFoundException;
import com.ronitech.employee_platform.mapper.DepartmentMapper;
import com.ronitech.employee_platform.repository.DepartmentRepository;
import com.ronitech.employee_platform.repository.EmployeeRepository;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository repository;
    private final DepartmentMapper mapper;
    private final EmployeeRepository employeeRepository;

    public DepartmentService(DepartmentRepository repository, DepartmentMapper mapper, EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.mapper = mapper;
        this.employeeRepository = employeeRepository;
    }

    public List<DepartmentResponse> findAll() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    public DepartmentResponse findById(Long id) {
        return mapper.toResponse(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id)));
    }

    public DepartmentResponse create(DepartmentRequest request) {
        Department department = mapper.toEntity(request);
        setManager(department, request.managerId());
        return mapper.toResponse(repository.save(department));
    }

    @Transactional
    public DepartmentResponse update(Long id, DepartmentRequest request) {
        Department department = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));
        department.setName(request.name());
        setManager(department, request.managerId());
        return mapper.toResponse(department);
    }

    public void delete(Long id) {
        repository.delete(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id)));
    }

    private void setManager(Department department, Long managerId) {
        if (managerId != null) {
            department.setManager(employeeRepository.findById(managerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", managerId)));
        }
    }
}
