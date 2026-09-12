package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.EmployeeRequest;
import com.ronitech.employee_platform.dto.EmployeeResponse;
import com.ronitech.employee_platform.dto.FileResponse;
import com.ronitech.employee_platform.entity.Department;
import com.ronitech.employee_platform.entity.Employee;
import com.ronitech.employee_platform.entity.User;
import com.ronitech.employee_platform.entity.enums.Role;
import com.ronitech.employee_platform.event.EmployeeCreatedEvent;
import com.ronitech.employee_platform.exception.ResourceNotFoundException;
import com.ronitech.employee_platform.mapper.EmployeeMapper;
import com.ronitech.employee_platform.publisher.EmployeeEventPublisher;
import com.ronitech.employee_platform.repository.DepartmentRepository;
import com.ronitech.employee_platform.repository.EmployeeRepository;
import com.ronitech.employee_platform.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
public class EmployeeService {

  private final EmployeeRepository employeeRepository;
  private final UserRepository userRepository;
  private final DepartmentRepository departmentRepository;
  private final EmployeeMapper mapper;
  private final RedisTemplate<String, Object> redisTemplate;
  private final EmployeeEventPublisher eventPublisher;
  private final FileStorageService fileStorageService;

  public EmployeeService(
    EmployeeRepository employeeRepository,
    UserRepository userRepository,
    DepartmentRepository departmentRepository,
    EmployeeMapper mapper,
    RedisTemplate<String, Object> redisTemplate,
    EmployeeEventPublisher eventPublisher,
    FileStorageService fileStorageService
  ) {
    this.employeeRepository = employeeRepository;
    this.userRepository = userRepository;
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

  public Page<EmployeeResponse> findAll(Pageable pageable) {
    return employeeRepository.findAll(pageable).map(mapper::toResponse);
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

    Employee employee = employeeRepository
      .findById(id)
      .orElseThrow(() -> {
        log.warn("Employee not found: {}", id);
        return new ResourceNotFoundException(
          "Employee not found with id: " + id
        );
      });

    EmployeeResponse response = mapper.toResponse(employee);

    redisTemplate.opsForValue().set(key, response, Duration.ofMinutes(10));

    return response;
  }

  public EmployeeResponse create(EmployeeRequest request) {
    log.info("Creating employee with email: {}", request.email());

    Employee employee = mapper.toEntity(request);

    Employee savedEmployee = employeeRepository.save(employee);

    EmployeeCreatedEvent event = new EmployeeCreatedEvent(
      savedEmployee.getId(),
      savedEmployee.getFirstName(),
      savedEmployee.getLastName(),
      savedEmployee.getEmail()
    );

    eventPublisher.publishEmployeeCreated(event);

    log.info(
      "Employee created successfully with id: {}",
      savedEmployee.getId()
    );

    return mapper.toResponse(savedEmployee);
  }

  @Transactional
  public EmployeeResponse update(Long id, EmployeeRequest request) {
    Employee employee = employeeRepository
      .findById(id)
      .orElseThrow(() ->
        new ResourceNotFoundException("Employee not found with id: " + id)
      );

    employee.setFirstName(request.firstName());
    employee.setLastName(request.lastName());
    employee.setEmail(request.email());

    EmployeeResponse response = mapper.toResponse(employee);

    redisTemplate.delete(employeeCacheKey(id));

    return response;
  }

  public void delete(Long id) {
    Employee employee = employeeRepository
      .findById(id)
      .orElseThrow(() ->
        new ResourceNotFoundException("Employee not found with id: " + id)
      );

    employeeRepository.delete(employee);

    redisTemplate.delete(employeeCacheKey(id));
  }

  public Page<EmployeeResponse> search(String name, Pageable pageable) {
    return employeeRepository
      .findByFirstNameContainingIgnoreCase(name, pageable)
      .map(mapper::toResponse);
  }

  public EmployeeResponse assignDepartment(Long employeeId, Long departmentId) {
    Employee employee = employeeRepository
      .findById(employeeId)
      .orElseThrow(() ->
        new ResourceNotFoundException(
          "Employee not found with id: " + employeeId
        )
      );

    Department department = departmentRepository
      .findById(departmentId)
      .orElseThrow(() ->
        new ResourceNotFoundException(
          "Department not found with id: " + departmentId
        )
      );

    employee.setDepartment(department);

    return mapper.toResponse(employeeRepository.save(employee));
  }

  public EmployeeResponse uploadProfileImage(
    Long employeeId,
    MultipartFile file
  ) throws IOException {
    log.info("Uploading profile image for employee {}", employeeId);

    Employee employee = employeeRepository
      .findById(employeeId)
      .orElseThrow(() -> {
        log.warn("Employee not found: {}", employeeId);

        return new ResourceNotFoundException(
          "Employee not found with id: " + employeeId
        );
      });

    validateProfileImage(file);

    log.debug(
      "Profile image validated: type={}, size={}",
      file.getContentType(),
      file.getSize()
    );

    String filename = fileStorageService.store(file, employeeId);

    employee.setProfileImage(filename);
    employee.setProfileImageContentType(file.getContentType());

    Employee savedEmployee = employeeRepository.save(employee);

    log.info("Profile image uploaded successfully for employee {}", employeeId);

    redisTemplate.delete(employeeCacheKey(employeeId));

    return mapper.toResponse(savedEmployee);
  }

  public FileResponse getProfileImage(Long employeeId) throws IOException {
    Employee employee = employeeRepository
      .findById(employeeId)
      .orElseThrow(() ->
        new ResourceNotFoundException(
          "Employee not found with id: " + employeeId
        )
      );

    if (employee.getProfileImage() == null) {
      throw new FileNotFoundException("Employee has no profile image");
    }

    byte[] data = fileStorageService.load(employee.getProfileImage());

    return new FileResponse(data, employee.getProfileImageContentType());
  }

  private void validateProfileImage(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("Profile image must not be empty");
    }

    long maxSize = 5 * 1024 * 1024;

    if (file.getSize() > maxSize) {
      throw new IllegalArgumentException("Profile image must not exceed 5 MB");
    }

    String contentType = file.getContentType();

    if (!isAllowedImageType(contentType)) {
      throw new IllegalArgumentException(
        "Only JPEG, PNG and WebP images are allowed"
      );
    }
  }

  private boolean isAllowedImageType(String contentType) {
    return (
      "image/jpeg".equals(contentType) ||
      "image/png".equals(contentType) ||
      "image/webp".equals(contentType)
    );
  }

  public EmployeeResponse linkUser(Long employeeId, Long userId) {
    Employee employee = employeeRepository
      .findById(employeeId)
      .orElseThrow(() ->
        new ResourceNotFoundException("Employee not found: " + employeeId)
      );

    User user = userRepository
      .findById(userId)
      .orElseThrow(() ->
        new ResourceNotFoundException("User not found: " + userId)
      );

    if (employee.getUser() != null) {
      throw new IllegalStateException("Employee already has a user account");
    }

    if (user.getEmployee() != null) {
      throw new IllegalStateException("User is already linked to an employee");
    }

    employee.setUser(user);
    user.setEmployee(employee);

    if (user.getRole() == Role.USER) {
      user.setRole(Role.EMPLOYEE);
    }
    userRepository.save(user);

    return mapper.toResponse(employee);
  }

  @Transactional
  public void changeRole(Long userId, Role newRole) {
    User user = userRepository
      .findById(userId)
      .orElseThrow(() -> new IllegalArgumentException("User not found"));

    user.setRole(newRole);
  }
}
