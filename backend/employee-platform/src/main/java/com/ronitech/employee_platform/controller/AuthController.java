package com.ronitech.employee_platform.controller;

import com.ronitech.employee_platform.dto.LoginRequest;
import com.ronitech.employee_platform.dto.LoginResponse;
import com.ronitech.employee_platform.dto.RegisterRequest;
import com.ronitech.employee_platform.dto.RegisterResponse;
import com.ronitech.employee_platform.entity.User;
import com.ronitech.employee_platform.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/register")
    public RegisterResponse register(
            @Valid @RequestBody RegisterRequest request) {

        return service.register(request);

    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request) {
        return service.login(request);
    }

    @PostMapping("/logout")
    public void logout(
            @Valid @RequestBody LoginRequest request) {
        // Implementation for logout
    }

    @GetMapping("/me")
    public String me(Authentication authentication) {

        return authentication.getName();

    }

    @GetMapping("/profile")
    public User profile(
            @AuthenticationPrincipal User user) {

        return user;

    }

}