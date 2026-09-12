package com.ronitech.employee_platform.mapper;

import com.ronitech.employee_platform.dto.DepartmentResponse;
import com.ronitech.employee_platform.dto.EmployeeRequest;
import com.ronitech.employee_platform.dto.EmployeeResponse;
import com.ronitech.employee_platform.entity.Department;
import com.ronitech.employee_platform.entity.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "department", ignore = true)
  @Mapping(target = "user", ignore = true)
  Employee toEntity(EmployeeRequest request);

  @Mapping(target = "userId", source = "user.id")
  EmployeeResponse toResponse(Employee employee);

  DepartmentResponse toDepartmentResponse(Department department);
}
