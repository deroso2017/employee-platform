package com.ronitech.employee_platform.controller;

import com.ronitech.employee_platform.dto.ProjectRequest;
import com.ronitech.employee_platform.dto.ProjectResponse;
import com.ronitech.employee_platform.service.ProjectService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

  private final ProjectService projectService;

  @PostMapping
  @PreAuthorize("hasAuthority('MANAGER')")
  @ResponseStatus(HttpStatus.CREATED)
  public ProjectResponse create(@Valid @RequestBody ProjectRequest request) {
    return projectService.create(request);
  }

  @GetMapping
  public List<ProjectResponse> findAll() {
    return projectService.findAll();
  }

  @GetMapping("/{id}")
  public ProjectResponse findById(@PathVariable Long id) {
    return projectService.findById(id);
  }

  @PatchMapping("/{id}")
  @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN')")
  public ProjectResponse update(
    @PathVariable Long id,
    @Valid @RequestBody ProjectRequest request
  ) {
    return projectService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    projectService.delete(id);
  }
}
