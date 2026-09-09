package com.ronitech.employee_platform.dto;

public record TeamMemberResponse(
  Long id,
  String firstName,
  String lastName,
  String email
) {}
