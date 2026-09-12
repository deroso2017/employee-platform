package com.ronitech.employee_platform.mapper;

import com.ronitech.employee_platform.dto.TaskRequest;
import com.ronitech.employee_platform.dto.TaskResponse;
import com.ronitech.employee_platform.entity.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TaskMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "project", ignore = true)
  @Mapping(target = "assignee", ignore = true)
  @Mapping(
    target = "status",
    expression = "java(request.status() != null ? request.status() : TaskStatus.TODO)"
  )
  @Mapping(
    target = "priority",
    expression = "java(request.priority() != null ? request.priority() : TaskPriority.MEDIUM)"
  )
  Task toEntity(TaskRequest request);

  @Mapping(target = "projectId", source = "project.id")
  @Mapping(target = "projectName", source = "project.name")
  @Mapping(target = "assigneeId", source = "assignee.id")
  @Mapping(
    target = "assigneeName",
    expression = "java(task.getAssignee() == null ? null : task.getAssignee().getFirstName() + \" \" + task.getAssignee().getLastName())"
  )
  TaskResponse toResponse(Task task);
}
