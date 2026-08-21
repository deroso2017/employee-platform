package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.EmployeeRequest;
import com.ronitech.employee_platform.dto.EmployeeResponse;
import com.ronitech.employee_platform.dto.FileResponse;
import com.ronitech.employee_platform.entity.Department;
import com.ronitech.employee_platform.entity.Employee;
import com.ronitech.employee_platform.event.EmployeeCreatedEvent;
import com.ronitech.employee_platform.event.EmployeeEventPublisher;
import com.ronitech.employee_platform.exception.EmployeeNotFoundException;
import com.ronitech.employee_platform.mapper.EmployeeMapper;
import com.ronitech.employee_platform.repository.DepartmentRepository;
import com.ronitech.employee_platform.repository.EmployeeRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.time.Duration;

@Slf4j
@Service
public class EmployeeService {

        private final EmployeeRepository employeeRepository;
        private final DepartmentRepository departmentRepository;
        private final EmployeeMapper mapper;
        private final RedisTemplate<String, Object> redisTemplate;
        private final EmployeeEventPublisher eventPublisher;
        private final FileStorageService fileStorageService;

        public EmployeeService(EmployeeRepository employeeRepository, DepartmentRepository departmentRepository,
                        EmployeeMapper mapper, RedisTemplate<String, Object> redisTemplate,
                        EmployeeEventPublisher eventPublisher, FileStorageService fileStorageService) {
                this.employeeRepository = employeeRepository;
                this.departmentRepository = departmentRepository;
                this.mapper = mapper;
                this.redisTemplate = redisTemplate;
                this.eventPublisher = eventPublisher;
                this.fileStorageService = fileStorageService;
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
                log.debug("Finding employee with id: {}", id);

                String key = employeeCacheKey(id);

                EmployeeResponse cached = (EmployeeResponse) redisTemplate
                                .opsForValue()
                                .get(key);

                if (cached != null) {
                        return cached;
                }

                Employee employee = employeeRepository.findById(id)
                                .orElseThrow(() -> {
                                        log.warn(
                                                        "Employee not found: {}",
                                                        id);
                                        return new EmployeeNotFoundException(id);
                                });

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
                log.info(
                                "Creating employee with email: {}",
                                request.email());

                Employee employee = mapper.toEntity(request);

                Employee savedEmployee = employeeRepository.save(employee);

                EmployeeCreatedEvent event = new EmployeeCreatedEvent(
                                savedEmployee.getId(),
                                savedEmployee.getFirstName(),
                                savedEmployee.getLastName(),
                                savedEmployee.getEmail());

                eventPublisher.publishEmployeeCreated(event);

                log.info(
                                "Employee created successfully with id: {}",
                                savedEmployee.getId());

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

        public EmployeeResponse uploadProfileImage(
                        Long employeeId,
                        MultipartFile file) throws IOException {

                log.info(
                                "Uploading profile image for employee {}",
                                employeeId);

                Employee employee = employeeRepository
                                .findById(employeeId)
                                .orElseThrow(() -> {
                                        log.warn(
                                                        "Employee not found: {}",
                                                        employeeId);

                                        return new EmployeeNotFoundException(
                                                        employeeId);
                                });

                validateProfileImage(file);

                log.debug(
                                "Profile image validated: type={}, size={}",
                                file.getContentType(),
                                file.getSize());

                String filename = fileStorageService.store(file, employeeId);

                employee.setProfileImage(filename);
                employee.setProfileImageContentType(
                                file.getContentType());

                Employee savedEmployee = employeeRepository.save(employee);

                log.info(
                                "Profile image uploaded successfully for employee {}",
                                employeeId);

                return mapper.toResponse(savedEmployee);
        }

        public FileResponse getProfileImage(
                        Long employeeId)
                        throws IOException {

                Employee employee = employeeRepository.findById(employeeId)
                                .orElseThrow(() -> new EmployeeNotFoundException(
                                                employeeId));

                if (employee.getProfileImage() == null) {
                        throw new FileNotFoundException(
                                        "Employee has no profile image");
                }

                byte[] data = fileStorageService.load(
                                employee.getProfileImage());

                return new FileResponse(
                                data,
                                employee.getProfileImageContentType());
        }

        private void validateProfileImage(
                        MultipartFile file) {

                if (file == null || file.isEmpty()) {
                        throw new IllegalArgumentException(
                                        "Profile image must not be empty");
                }

                long maxSize = 5 * 1024 * 1024;

                if (file.getSize() > maxSize) {
                        throw new IllegalArgumentException(
                                        "Profile image must not exceed 5 MB");
                }

                String contentType = file.getContentType();

                if (!isAllowedImageType(contentType)) {
                        throw new IllegalArgumentException(
                                        "Only JPEG, PNG and WebP images are allowed");
                }
        }

        private boolean isAllowedImageType(
                        String contentType) {

                return "image/jpeg".equals(contentType)
                                || "image/png".equals(contentType)
                                || "image/webp".equals(contentType);
        }

}