package com.ronitech.employee_platform.dto;

import com.ronitech.employee_platform.entity.enums.TaskPriority;
import com.ronitech.employee_platform.entity.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TaskRequest(
  @NotBlank @Size(max = 255) String title,

  @Size(max = 5000) String description,

  TaskStatus status,

  TaskPriority priority,

  Long assigneeId
) {}
