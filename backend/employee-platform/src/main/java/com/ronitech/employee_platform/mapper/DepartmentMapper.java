package com.ronitech.employee_platform.mapper;

import com.ronitech.employee_platform.dto.DepartmentRequest;
import com.ronitech.employee_platform.dto.DepartmentResponse;
import com.ronitech.employee_platform.entity.Department;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DepartmentMapper {

    @Mapping(target = "manager", ignore = true)
    Department toEntity(DepartmentRequest request);

    @Mapping(target = "managerId", source = "manager.id")
    @Mapping(target = "managerName", expression = "java(department.getManager() != null ? department.getManager().getFirstName() + \" \" + department.getManager().getLastName() : null)")
    DepartmentResponse toResponse(Department department);
}
