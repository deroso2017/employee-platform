package com.ronitech.employee_platform.controller;

import com.ronitech.employee_platform.dto.DepartmentResponse;
import com.ronitech.employee_platform.dto.EmployeeResponse;
import com.ronitech.employee_platform.dto.UserProfileResponse;
import com.ronitech.employee_platform.dto.auth.ChangePasswordRequest;
import com.ronitech.employee_platform.dto.auth.LoginRequest;
import com.ronitech.employee_platform.dto.auth.LoginResponse;
import com.ronitech.employee_platform.dto.auth.LogoutRequest;
import com.ronitech.employee_platform.dto.auth.PasswordResetRequest;
import com.ronitech.employee_platform.dto.auth.RefreshRequest;
import com.ronitech.employee_platform.dto.auth.RegisterRequest;
import com.ronitech.employee_platform.dto.auth.RegisterResponse;
import com.ronitech.employee_platform.entity.Employee;
import com.ronitech.employee_platform.entity.User;
import com.ronitech.employee_platform.repository.UserRepository;
import com.ronitech.employee_platform.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService service;
  private final UserRepository userRepository;

  @PostMapping("/register")
  public RegisterResponse register(
    @Valid @RequestBody RegisterRequest request
  ) {
    return service.register(request);
  }

  @PostMapping("/login")
  public LoginResponse login(@Valid @RequestBody LoginRequest request) {
    return service.login(request);
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(
    @Valid @RequestBody LogoutRequest request
  ) {
    service.logout(request);

    return ResponseEntity.noContent().build();
  }

  @PostMapping("/logout-all")
  public ResponseEntity<Void> logoutAll(@AuthenticationPrincipal User user) {
    service.logoutAll(user);

    return ResponseEntity.noContent().build();
  }

  @PostMapping("/refresh")
  public LoginResponse refresh(@Valid @RequestBody RefreshRequest request) {
    return service.refresh(request);
  }

  @GetMapping("/me")
  public String me(Authentication authentication) {
    return authentication.getName();
  }

  @GetMapping("/profile")
  @Transactional(readOnly = true)
  public UserProfileResponse getProfile(
    @AuthenticationPrincipal User principal
  ) {
    // Fetch a fresh managed entity using the principal's ID to keep the session alive
    User user = userRepository
      .findById(principal.getId())
      .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    Employee employee = user.getEmployee();

    EmployeeResponse employeeResponse =
      employee == null
        ? null
        : new EmployeeResponse(
            employee.getId(),
            employee.getFirstName(),
            employee.getLastName(),
            employee.getEmail(),
            employee.getProfileImage(),
            employee.getUser().getId(),
            employee.getDepartment() == null
              ? null
              : new DepartmentResponse(
                  employee.getDepartment().getId(),
                  employee.getDepartment().getName()
                )
          );

    return new UserProfileResponse(
      user.getId(),
      user.getEmail(),
      user.getRole().name(),
      employeeResponse
    );
  }

  @PostMapping("/forgot-password")
  public ResponseEntity<Void> forgotPassword(@RequestParam String email) {
    service.requestPasswordReset(email);

    return ResponseEntity.ok().build();
  }

  @PostMapping("/reset-password")
  public ResponseEntity<Void> resetPassword(
    @Valid @RequestBody PasswordResetRequest request
  ) {
    service.resetPassword(request);

    return ResponseEntity.ok().build();
  }

  @PostMapping("/change-password")
  public ResponseEntity<Void> changePassword(
    @AuthenticationPrincipal User principal,
    @Valid @RequestBody ChangePasswordRequest request
  ) {
    service.changePassword(principal, request);

    return ResponseEntity.noContent().build();
  }
}
