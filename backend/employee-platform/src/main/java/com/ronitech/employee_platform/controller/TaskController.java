package com.ronitech.employee_platform.controller;

import com.ronitech.employee_platform.dto.TaskRequest;
import com.ronitech.employee_platform.dto.TaskResponse;
import com.ronitech.employee_platform.service.TaskService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {

  private final TaskService taskService;

  @PostMapping("/projects/{projectId}/tasks")
  @PreAuthorize("hasAuthority('MANAGER')")
  @ResponseStatus(HttpStatus.CREATED)
  public TaskResponse create(
    @PathVariable Long projectId,
    @Valid @RequestBody TaskRequest request
  ) {
    return taskService.create(projectId, request);
  }

  @GetMapping("/projects/{projectId}/tasks")
  public List<TaskResponse> findByProject(@PathVariable Long projectId) {
    return taskService.findByProject(projectId);
  }

  @GetMapping("/tasks/{taskId}")
  public TaskResponse findById(@PathVariable Long taskId) {
    return taskService.findById(taskId);
  }

  @PatchMapping("/tasks/{taskId}")
  @PreAuthorize("hasAuthority('MANAGER')")
  public TaskResponse update(
    @PathVariable Long taskId,
    @Valid @RequestBody TaskRequest request
  ) {
    return taskService.update(taskId, request);
  }

  @DeleteMapping("/tasks/{taskId}")
  @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long taskId) {
    taskService.delete(taskId);
  }
}
