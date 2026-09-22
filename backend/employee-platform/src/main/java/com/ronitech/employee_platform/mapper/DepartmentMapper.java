package com.ronitech.employee_platform.mapper;

import com.ronitech.employee_platform.dto.DepartmentRequest;
import com.ronitech.employee_platform.dto.DepartmentResponse;
import com.ronitech.employee_platform.entity.Department;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(
  componentModel = "spring",
  unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface DepartmentMapper {
  Department toEntity(DepartmentRequest request);

  DepartmentResponse toResponse(Department department);
}
