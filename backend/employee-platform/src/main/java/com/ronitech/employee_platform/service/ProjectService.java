package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.ProjectRequest;
import com.ronitech.employee_platform.dto.ProjectResponse;
import com.ronitech.employee_platform.entity.Employee;
import com.ronitech.employee_platform.entity.Project;
import com.ronitech.employee_platform.entity.Team;
import com.ronitech.employee_platform.exception.ResourceNotFoundException;
import com.ronitech.employee_platform.mapper.ProjectMapper;
import com.ronitech.employee_platform.repository.ProjectRepository;
import com.ronitech.employee_platform.repository.TeamRepository;
import com.ronitech.employee_platform.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

  private final ProjectRepository projectRepository;
  private final TeamRepository teamRepository;
  private final ProjectMapper projectMapper;
  private final CurrentUserService currentUserService;

  public ProjectResponse create(ProjectRequest request) {
    Team team = teamRepository
      .findById(request.teamId())
      .orElseThrow(() ->
        new ResourceNotFoundException("Team not found: " + request.teamId())
      );

    Employee manager = currentUserService.getCurrentEmployee();

    Project project = projectMapper.toEntity(request);

    project.setTeam(team);
    project.setManager(manager);

    Project saved = projectRepository.save(project);

    return projectMapper.toResponse(saved);
  }

  @Transactional(readOnly = true)
  public List<ProjectResponse> findAll() {
    return projectRepository
      .findAll()
      .stream()
      .map(projectMapper::toResponse)
      .toList();
  }

  @Transactional(readOnly = true)
  public ProjectResponse findById(Long id) {
    Project project = findProject(id);

    return projectMapper.toResponse(project);
  }

  public ProjectResponse update(Long id, ProjectRequest request) {
    Project project = findProject(id);

    Team team = teamRepository
      .findById(request.teamId())
      .orElseThrow(() ->
        new ResourceNotFoundException("Team not found: " + request.teamId())
      );

    project.setName(request.name());
    project.setDescription(request.description());
    project.setTeam(team);

    if (request.status() != null) {
      project.setStatus(request.status());
    }

    return projectMapper.toResponse(project);
  }

  public void delete(Long id) {
    Project project = findProject(id);

    projectRepository.delete(project);
  }

  private Project findProject(Long id) {
    return projectRepository
      .findById(id)
      .orElseThrow(() ->
        new ResourceNotFoundException("Project not found: " + id)
      );
  }
}
