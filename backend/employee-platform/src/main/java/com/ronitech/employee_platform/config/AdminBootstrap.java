package com.ronitech.employee_platform.config;

import com.ronitech.employee_platform.entity.Role;
import com.ronitech.employee_platform.entity.User;
import com.ronitech.employee_platform.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class AdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.initial-admin.email:}")
    private String adminEmail;

    @Value("${app.initial-admin.password:}")
    private String adminPassword;

    @Override
    public void run(String... args) {

        if (adminEmail == null || adminEmail.isBlank()) {
            return;
        }

        if (adminPassword == null || adminPassword.isBlank()) {
            throw new IllegalStateException(
                    "Initial admin password is not configured");
        }

        if (userRepository.findByEmail(adminEmail).isPresent()) {
            return;
        }

        User admin = new User();

        admin.setEmail(adminEmail);
        admin.setPassword(
                passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);

        userRepository.save(admin);

        System.out.println(
                "Initial ADMIN account created: "
                        + adminEmail);
    }
}