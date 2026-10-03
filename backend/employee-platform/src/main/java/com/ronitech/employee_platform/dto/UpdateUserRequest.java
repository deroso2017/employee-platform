package com.ronitech.employee_platform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
  @Email @NotBlank String email,

  @Size(min = 8, max = 100) String password
) {}
