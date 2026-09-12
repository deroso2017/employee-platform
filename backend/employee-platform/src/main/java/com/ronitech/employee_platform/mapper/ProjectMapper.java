package com.ronitech.employee_platform.mapper;

import com.ronitech.employee_platform.dto.ProjectRequest;
import com.ronitech.employee_platform.dto.ProjectResponse;
import com.ronitech.employee_platform.entity.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProjectMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "team", ignore = true)
  @Mapping(target = "manager", ignore = true)
  @Mapping(
    target = "status",
    expression = "java(request.status() != null ? request.status() : com.ronitech.employee_platform.entity.enums.ProjectStatus.PLANNED)"
  )
  Project toEntity(ProjectRequest request);

  @Mapping(target = "teamId", source = "team.id")
  @Mapping(target = "teamName", source = "team.name")
  @Mapping(target = "managerId", source = "manager.id")
  @Mapping(
    target = "managerName",
    expression = "java(project.getManager().getFirstName() + \" \" + project.getManager().getLastName())"
  )
  ProjectResponse toResponse(Project project);
}
