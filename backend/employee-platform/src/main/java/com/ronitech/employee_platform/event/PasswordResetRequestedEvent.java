package com.ronitech.employee_platform.event;

public record PasswordResetRequestedEvent(
        Long userId,
        String email,
        String resetToken) {
}