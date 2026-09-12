package com.ronitech.employee_platform.dto;

import com.ronitech.employee_platform.entity.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProjectRequest(
  @NotBlank @Size(max = 255) String name,

  @Size(max = 2000) String description,

  @NotNull Long teamId,

  ProjectStatus status
) {}
