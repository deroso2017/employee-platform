package com.ronitech.employee_platform.mapper;

import com.ronitech.employee_platform.dto.ProjectRequest;
import com.ronitech.employee_platform.dto.ProjectResponse;
import com.ronitech.employee_platform.entity.Project;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    Project toEntity(ProjectRequest request);

    ProjectResponse toResponse(Project project);
}
