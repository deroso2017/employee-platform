package com.ronitech.employee_platform.dto;

public record TeamResponse(
    Long id,
    String name,
    int memberCount
) {}
