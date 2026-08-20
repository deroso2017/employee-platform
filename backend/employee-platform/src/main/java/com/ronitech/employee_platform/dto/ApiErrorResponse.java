package com.ronitech.employee_platform.dto;

public record ApiErrorResponse(
        int status,
        String message) {
}