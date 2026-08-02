package com.ronitech.employee_platform.controller;

import com.ronitech.employee_platform.dto.LoginRequest;
import com.ronitech.employee_platform.dto.LoginResponse;
import com.ronitech.employee_platform.dto.RegisterRequest;
import com.ronitech.employee_platform.dto.RegisterResponse;
import com.ronitech.employee_platform.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

}