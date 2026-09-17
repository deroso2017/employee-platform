package com.ronitech.employee_platform.dto;

import com.ronitech.employee_platform.dto.ProjectResponse;
import com.ronitech.employee_platform.dto.TaskResponse;
import java.util.List;
import java.util.Map;

public record DashboardResponse(
  Overview overview,
  ProjectOverview projects,
  TaskOverview tasks,
  List<ProjectResponse> recentProjects,
  List<TaskResponse> myTasks
) {
  public record Overview(
    long employees,
    long departments,
    long teams,
    long projects,
    long tasks
  ) {}

  public record ProjectOverview(Map<String, Long> byStatus) {}

  public record TaskOverview(
    Map<String, Long> byStatus,
    Map<String, Long> byPriority
  ) {}
}
