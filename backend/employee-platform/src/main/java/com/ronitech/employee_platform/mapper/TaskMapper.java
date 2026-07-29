package com.ronitech.employee_platform.mapper;

import com.ronitech.employee_platform.dto.TaskRequest;
import com.ronitech.employee_platform.dto.TaskResponse;
import com.ronitech.employee_platform.entity.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TaskMapper {

    @Mapping(target = "assignedEmployee", ignore = true)
    Task toEntity(TaskRequest request);

    @Mapping(target = "assignedEmployeeId", source = "assignedEmployee.id")
    @Mapping(target = "assignedEmployeeName", expression = "java(task.getAssignedEmployee() != null ? task.getAssignedEmployee().getFirstName() + \" \" + task.getAssignedEmployee().getLastName() : null)")
    TaskResponse toResponse(Task task);
}
