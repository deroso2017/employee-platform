package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.entity.Employee;
import com.ronitech.employee_platform.entity.User;
import com.ronitech.employee_platform.exception.ResourceNotFoundException;
import com.ronitech.employee_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CurrentUserService {

  private final UserRepository userRepository;

  public User getCurrentUser() {
    Authentication authentication =
      SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()) {
      throw new AccessDeniedException("User is not authenticated");
    }

    String email = authentication.getName();

    return userRepository
      .findByEmail(email)
      .orElseThrow(() ->
        new ResourceNotFoundException("Authenticated user not found")
      );
  }

  public Employee getCurrentEmployee() {
    User user = getCurrentUser();

    if (user.getEmployee() == null) {
      throw new AccessDeniedException(
        "Authenticated user is not linked to an employee"
      );
    }

    return user.getEmployee();
  }
}
