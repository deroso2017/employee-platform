package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.ProjectRequest;
import com.ronitech.employee_platform.dto.ProjectResponse;
import com.ronitech.employee_platform.entity.Project;
import com.ronitech.employee_platform.exception.ResourceNotFoundException;
import com.ronitech.employee_platform.mapper.ProjectMapper;
import com.ronitech.employee_platform.repository.ProjectRepository;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository repository;
    private final ProjectMapper mapper;

    public ProjectService(ProjectRepository repository, ProjectMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<ProjectResponse> findAll() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    public ProjectResponse findById(Long id) {
        return mapper.toResponse(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id)));
    }

    public ProjectResponse create(ProjectRequest request) {
        return mapper.toResponse(repository.save(mapper.toEntity(request)));
    }

    @Transactional
    public ProjectResponse update(Long id, ProjectRequest request) {
        Project project = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        project.setName(request.name());
        project.setStatus(request.status());
        project.setDeadline(request.deadline());
        return mapper.toResponse(project);
    }

    public void delete(Long id) {
        repository.delete(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id)));
    }
}
