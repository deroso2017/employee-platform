package com.ronitech.employee_platform.event;

public record UserRegisteredEvent(
        Long userId,
        String email) {
}