package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.TaskRequest;
import com.ronitech.employee_platform.dto.TaskResponse;
import com.ronitech.employee_platform.entity.Employee;
import com.ronitech.employee_platform.entity.Project;
import com.ronitech.employee_platform.entity.Task;
import com.ronitech.employee_platform.exception.ResourceNotFoundException;
import com.ronitech.employee_platform.mapper.TaskMapper;
import com.ronitech.employee_platform.repository.EmployeeRepository;
import com.ronitech.employee_platform.repository.ProjectRepository;
import com.ronitech.employee_platform.repository.TaskRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

  private final TaskRepository taskRepository;
  private final ProjectRepository projectRepository;
  private final EmployeeRepository employeeRepository;
  private final TaskMapper mapper;

  public TaskResponse create(Long projectId, TaskRequest request) {
    Project project = findProject(projectId);

    Task task = mapper.toEntity(request);

    task.setProject(project);

    if (request.assigneeId() != null) {
      Employee assignee = findEmployee(request.assigneeId());

      validateAssigneeBelongsToProjectTeam(assignee, project);

      task.setAssignee(assignee);
    }

    Task savedTask = taskRepository.save(task);

    return mapper.toResponse(savedTask);
  }

  @Transactional(readOnly = true)
  public List<TaskResponse> findByProject(Long projectId) {
    findProject(projectId);

    return taskRepository
      .findByProjectId(projectId)
      .stream()
      .map(mapper::toResponse)
      .toList();
  }

  @Transactional(readOnly = true)
  public TaskResponse findById(Long taskId) {
    Task task = findTask(taskId);

    return mapper.toResponse(task);
  }

  public TaskResponse update(Long taskId, TaskRequest request) {
    Task task = findTask(taskId);

    task.setTitle(request.title());
    task.setDescription(request.description());

    if (request.status() != null) {
      task.setStatus(request.status());
    }

    if (request.priority() != null) {
      task.setPriority(request.priority());
    }

    if (request.assigneeId() != null) {
      Employee assignee = findEmployee(request.assigneeId());

      validateAssigneeBelongsToProjectTeam(assignee, task.getProject());

      task.setAssignee(assignee);
    } else {
      task.setAssignee(null);
    }

    return mapper.toResponse(task);
  }

  public void delete(Long taskId) {
    Task task = findTask(taskId);

    taskRepository.delete(task);
  }

  private Task findTask(Long taskId) {
    return taskRepository
      .findById(taskId)
      .orElseThrow(() ->
        new ResourceNotFoundException("Task not found: " + taskId)
      );
  }

  private Project findProject(Long projectId) {
    return projectRepository
      .findById(projectId)
      .orElseThrow(() ->
        new ResourceNotFoundException("Project not found: " + projectId)
      );
  }

  private Employee findEmployee(Long employeeId) {
    return employeeRepository
      .findById(employeeId)
      .orElseThrow(() ->
        new ResourceNotFoundException("Employee not found: " + employeeId)
      );
  }

  private void validateAssigneeBelongsToProjectTeam(
    Employee assignee,
    Project project
  ) {
    boolean isTeamMember = project.getTeam().getMembers().contains(assignee);

    if (!isTeamMember) {
      throw new IllegalStateException(
        "Employee is not a member of the project's team"
      );
    }
  }
}
