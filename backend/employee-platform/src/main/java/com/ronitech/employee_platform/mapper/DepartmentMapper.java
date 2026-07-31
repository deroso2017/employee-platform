package com.ronitech.employee_platform.mapper;

import com.ronitech.employee_platform.dto.DepartmentRequest;
import com.ronitech.employee_platform.dto.DepartmentResponse;
import com.ronitech.employee_platform.entity.Department;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DepartmentMapper {

    Department toEntity(DepartmentRequest request);

    DepartmentResponse toResponse(Department department);

}