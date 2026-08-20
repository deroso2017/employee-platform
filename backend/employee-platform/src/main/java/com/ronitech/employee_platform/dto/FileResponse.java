package com.ronitech.employee_platform.dto;

public record FileResponse(
        byte[] data,
        String contentType) {
}
