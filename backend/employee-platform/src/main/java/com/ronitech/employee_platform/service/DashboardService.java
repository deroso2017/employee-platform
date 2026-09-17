package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.DashboardResponse;
import com.ronitech.employee_platform.dto.ProjectResponse;
import com.ronitech.employee_platform.dto.TaskResponse;
import com.ronitech.employee_platform.entity.Employee;
import com.ronitech.employee_platform.entity.enums.ProjectStatus;
import com.ronitech.employee_platform.entity.enums.TaskPriority;
import com.ronitech.employee_platform.entity.enums.TaskStatus;
import com.ronitech.employee_platform.mapper.ProjectMapper;
import com.ronitech.employee_platform.mapper.TaskMapper;
import com.ronitech.employee_platform.repository.DepartmentRepository;
import com.ronitech.employee_platform.repository.EmployeeRepository;
import com.ronitech.employee_platform.repository.ProjectRepository;
import com.ronitech.employee_platform.repository.TaskRepository;
import com.ronitech.employee_platform.repository.TeamRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

  private final EmployeeRepository employeeRepository;
  private final DepartmentRepository departmentRepository;
  private final TeamRepository teamRepository;
  private final ProjectRepository projectRepository;
  private final TaskRepository taskRepository;
  private final ProjectMapper projectMapper;
  private final TaskMapper taskMapper;
  private final CurrentUserService currentUserService;

  public DashboardResponse getDashboard() {
    DashboardResponse.Overview overview = new DashboardResponse.Overview(
      employeeRepository.count(),
      departmentRepository.count(),
      teamRepository.count(),
      projectRepository.count(),
      taskRepository.count()
    );

    DashboardResponse.ProjectOverview projectOverview =
      new DashboardResponse.ProjectOverview(buildProjectStatusStatistics());

    DashboardResponse.TaskOverview taskOverview =
      new DashboardResponse.TaskOverview(
        buildTaskStatusStatistics(),
        buildTaskPriorityStatistics()
      );

    List<ProjectResponse> recentProjects = projectRepository
      .findTop5ByOrderByIdDesc()
      .stream()
      .map(projectMapper::toResponse)
      .toList();

    List<TaskResponse> myTasks = getMyTasks();

    return new DashboardResponse(
      overview,
      projectOverview,
      taskOverview,
      recentProjects,
      myTasks
    );
  }

  private Map<String, Long> buildProjectStatusStatistics() {
    Map<String, Long> result = new LinkedHashMap<>();

    for (ProjectStatus status : ProjectStatus.values()) {
      result.put(status.name(), 0L);
    }

    for (Object[] row : projectRepository.countByStatus()) {
      ProjectStatus status = (ProjectStatus) row[0];
      Long count = (Long) row[1];

      result.put(status.name(), count);
    }

    return result;
  }

  private Map<String, Long> buildTaskStatusStatistics() {
    Map<String, Long> result = new LinkedHashMap<>();

    for (TaskStatus status : TaskStatus.values()) {
      result.put(status.name(), 0L);
    }

    for (Object[] row : taskRepository.countByStatus()) {
      TaskStatus status = (TaskStatus) row[0];
      Long count = (Long) row[1];

      result.put(status.name(), count);
    }

    return result;
  }

  private Map<String, Long> buildTaskPriorityStatistics() {
    Map<String, Long> result = new LinkedHashMap<>();

    for (TaskPriority priority : TaskPriority.values()) {
      result.put(priority.name(), 0L);
    }

    for (Object[] row : taskRepository.countByPriority()) {
      TaskPriority priority = (TaskPriority) row[0];
      Long count = (Long) row[1];

      result.put(priority.name(), count);
    }

    return result;
  }

  private List<TaskResponse> getMyTasks() {
    Employee employee = currentUserService.getCurrentEmployeeOrNull();

    if (employee == null) {
      return List.of();
    }

    return taskRepository
      .findByAssigneeIdOrderByIdDesc(employee.getId())
      .stream()
      .limit(5)
      .map(taskMapper::toResponse)
      .toList();
  }
}
