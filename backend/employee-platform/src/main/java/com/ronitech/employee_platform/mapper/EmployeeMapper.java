package com.ronitech.employee_platform.mapper;

import com.ronitech.employee_platform.dto.DepartmentResponse;
import com.ronitech.employee_platform.dto.EmployeeRequest;
import com.ronitech.employee_platform.dto.EmployeeResponse;
import com.ronitech.employee_platform.entity.Department;
import com.ronitech.employee_platform.entity.Employee;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    Employee toEntity(EmployeeRequest request);

    EmployeeResponse toResponse(Employee employee);

    DepartmentResponse toDepartmentResponse(Department department);

}
