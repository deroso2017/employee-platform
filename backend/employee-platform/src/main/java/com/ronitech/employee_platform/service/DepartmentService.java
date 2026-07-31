package com.ronitech.employee_platform.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import com.ronitech.employee_platform.dto.DepartmentRequest;
import com.ronitech.employee_platform.dto.DepartmentResponse;
import com.ronitech.employee_platform.entity.Department;
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

}
