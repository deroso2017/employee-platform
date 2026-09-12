package com.ronitech.employee_platform.dto;

import com.ronitech.employee_platform.entity.enums.ProjectStatus;

public record ProjectResponse(
  Long id,
  String name,
  String description,
  ProjectStatus status,
  Long teamId,
  String teamName,
  Long managerId,
  String managerName
) {}
