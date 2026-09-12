package com.ronitech.employee_platform.dto;

import com.ronitech.employee_platform.entity.enums.TaskPriority;
import com.ronitech.employee_platform.entity.enums.TaskStatus;

public record TaskResponse(
  Long id,
  String title,
  String description,
  TaskStatus status,
  TaskPriority priority,
  Long projectId,
  String projectName,
  Long assigneeId,
  String assigneeName
) {}
