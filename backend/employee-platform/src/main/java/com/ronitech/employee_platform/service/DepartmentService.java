package com.ronitech.employee_platform.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ronitech.employee_platform.dto.DepartmentRequest;
import com.ronitech.employee_platform.dto.DepartmentResponse;
import com.ronitech.employee_platform.entity.Department;
import com.ronitech.employee_platform.exception.DepartmentNotFoundException;
import com.ronitech.employee_platform.mapper.DepartmentMapper;
import com.ronitech.employee_platform.repository.DepartmentRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentService {

    private final DepartmentRepository repository;
    private final DepartmentMapper mapper;

    public DepartmentResponse create(DepartmentRequest request) {

        Department department = mapper.toEntity(request);
        Department savedDepartment = repository.save(department);

        return mapper.toResponse(savedDepartment);
    }

    public List<DepartmentResponse> getDepartments() {
        List<Department> departments = repository.findAll();
        return departments.stream()
                .map(mapper::toResponse)
                .toList();

    }

    public void delete(Long id) {

        Department department = repository.findById(id)
                .orElseThrow(() -> new DepartmentNotFoundException(id));

        repository.delete(department);

    }

}
