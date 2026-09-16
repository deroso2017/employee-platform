package com.ronitech.employee_platform.dto.auth;

import jakarta.validation.constraints.Email;

public record UserRequest(@Email String email, String role) {}
