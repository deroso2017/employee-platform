package com.ronitech.employee_platform.dto.auth;

import com.ronitech.employee_platform.dto.EmployeeResponse;

public record RegisterResponse(
  Long id,
  String email,
  String role,
  EmployeeResponse employee
) {}
