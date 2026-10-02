package com.ronitech.employee_platform.dto;

public record UserProfileResponse(
  Long id,
  String email,
  String role,
  EmployeeResponse employee
) {}
