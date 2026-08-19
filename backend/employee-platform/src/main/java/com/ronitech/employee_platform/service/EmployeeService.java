package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.EmployeeRequest;
import com.ronitech.employee_platform.dto.EmployeeResponse;
import com.ronitech.employee_platform.entity.Department;
import com.ronitech.employee_platform.entity.Employee;
import com.ronitech.employee_platform.event.EmployeeCreatedEvent;
import com.ronitech.employee_platform.event.EmployeeEventPublisher;
import com.ronitech.employee_platform.exception.EmployeeNotFoundException;
import com.ronitech.employee_platform.mapper.EmployeeMapper;
import com.ronitech.employee_platform.repository.DepartmentRepository;
import com.ronitech.employee_platform.repository.EmployeeRepository;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
public class EmployeeService {

        private final EmployeeRepository employeeRepository;
        private final DepartmentRepository departmentRepository;
        private final EmployeeMapper mapper;
        private final RedisTemplate<String, Object> redisTemplate;
        private final EmployeeEventPublisher eventPublisher;

        public EmployeeService(EmployeeRepository employeeRepository, DepartmentRepository departmentRepository,
                        EmployeeMapper mapper, RedisTemplate<String, Object> redisTemplate,
                        EmployeeEventPublisher eventPublisher) {
                this.employeeRepository = employeeRepository;
                this.departmentRepository = departmentRepository;
                this.mapper = mapper;
                this.redisTemplate = redisTemplate;
                this.eventPublisher = eventPublisher;
        }

        private String employeeCacheKey(Long id) {
                return "employee:" + id;
        }

        // Old approach:
        // This returns the database Entity directly to the Controller.
        // public List<Employee> findAll() {
        // return repository.findAll();
        // }

        public Page<EmployeeResponse> findAll(
                        Pageable pageable) {

                return employeeRepository.findAll(pageable)
                                .map(mapper::toResponse);

        }

        public EmployeeResponse findById(Long id) {

                String key = employeeCacheKey(id);

                EmployeeResponse cached = (EmployeeResponse) redisTemplate
                                .opsForValue()
                                .get(key);

                if (cached != null) {
                        return cached;
                }

                Employee employee = employeeRepository.findById(id)
                                .orElseThrow(() -> new EmployeeNotFoundException(id));

                EmployeeResponse response = mapper.toResponse(employee);

                redisTemplate
                                .opsForValue()
                                .set(
                                                key,
                                                response,
                                                Duration.ofMinutes(10));

                return response;
        }

        public EmployeeResponse create(EmployeeRequest request) {

                Employee employee = mapper.toEntity(request);

                Employee savedEmployee = employeeRepository.save(employee);

                EmployeeCreatedEvent event = new EmployeeCreatedEvent(
                                savedEmployee.getId(),
                                savedEmployee.getFirstName(),
                                savedEmployee.getLastName(),
                                savedEmployee.getEmail());

                eventPublisher.publishEmployeeCreated(event);

                return mapper.toResponse(savedEmployee);

        }

        @Transactional
        public EmployeeResponse update(
                        Long id,
                        EmployeeRequest request) {

                Employee employee = employeeRepository.findById(id)
                                .orElseThrow(() -> new EmployeeNotFoundException(id));

                employee.setFirstName(request.firstName());
                employee.setLastName(request.lastName());
                employee.setEmail(request.email());

                EmployeeResponse response = mapper.toResponse(employee);

                redisTemplate.delete(employeeCacheKey(id));

                return response;

        }

        public void delete(Long id) {

                Employee employee = employeeRepository.findById(id)
                                .orElseThrow(() -> new EmployeeNotFoundException(id));

                employeeRepository.delete(employee);

                redisTemplate.delete(employeeCacheKey(id));

        }

        public Page<EmployeeResponse> search(String name, Pageable pageable) {

                return employeeRepository
                                .findByFirstNameContainingIgnoreCase(
                                                name,
                                                pageable)
                                .map(mapper::toResponse);

        }

        public EmployeeResponse assignDepartment(
                        Long employeeId,
                        Long departmentId) {

                Employee employee = employeeRepository
                                .findById(employeeId)
                                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

                Department department = departmentRepository
                                .findById(departmentId)
                                .orElseThrow();

                employee.setDepartment(department);

                return mapper.toResponse(
                                employeeRepository.save(employee));
        }

}