package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.TaskRequest;
import com.ronitech.employee_platform.dto.TaskResponse;
import com.ronitech.employee_platform.entity.Task;
import com.ronitech.employee_platform.exception.ResourceNotFoundException;
import com.ronitech.employee_platform.mapper.TaskMapper;
import com.ronitech.employee_platform.repository.EmployeeRepository;
import com.ronitech.employee_platform.repository.TaskRepository;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository repository;
    private final TaskMapper mapper;
    private final EmployeeRepository employeeRepository;

    public TaskService(TaskRepository repository, TaskMapper mapper, EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.mapper = mapper;
        this.employeeRepository = employeeRepository;
    }

    public List<TaskResponse> findAll() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    public TaskResponse findById(Long id) {
        return mapper.toResponse(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id)));
    }

    public TaskResponse create(TaskRequest request) {
        Task task = mapper.toEntity(request);
        setEmployee(task, request.assignedEmployeeId());
        return mapper.toResponse(repository.save(task));
    }

    @Transactional
    public TaskResponse update(Long id, TaskRequest request) {
        Task task = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(request.priority());
        task.setStatus(request.status());
        setEmployee(task, request.assignedEmployeeId());
        return mapper.toResponse(task);
    }

    public void delete(Long id) {
        repository.delete(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id)));
    }

    private void setEmployee(Task task, Long employeeId) {
        if (employeeId != null) {
            task.setAssignedEmployee(employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", employeeId)));
        }
    }
}
