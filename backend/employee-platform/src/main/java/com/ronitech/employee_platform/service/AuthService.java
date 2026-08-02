package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.RegisterRequest;
import com.ronitech.employee_platform.dto.RegisterResponse;
import com.ronitech.employee_platform.entity.User;
import com.ronitech.employee_platform.exception.EmailAlreadyExistsException;
import com.ronitech.employee_platform.mapper.UserMapper;
import com.ronitech.employee_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository repository;
    private final UserMapper mapper;
    private final PasswordEncoder passwordEncoder;

    public RegisterResponse register(RegisterRequest request) {

        if (repository.findByEmail(request.email()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        User user = mapper.toEntity(request);

        user.setPassword(
                passwordEncoder.encode(request.password()));

        return mapper.toResponse(
                repository.save(user));
    }

}