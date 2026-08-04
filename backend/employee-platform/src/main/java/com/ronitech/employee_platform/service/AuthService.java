package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.LoginRequest;
import com.ronitech.employee_platform.dto.LoginResponse;
import com.ronitech.employee_platform.dto.RegisterRequest;
import com.ronitech.employee_platform.dto.RegisterResponse;
import com.ronitech.employee_platform.entity.User;
import com.ronitech.employee_platform.exception.EmailAlreadyExistsException;
import com.ronitech.employee_platform.mapper.UserMapper;
import com.ronitech.employee_platform.repository.RefreshTokenRepository;
import com.ronitech.employee_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository repository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserMapper mapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

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

    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(

                new UsernamePasswordAuthenticationToken(

                        request.email(),

                        request.password()

                ));

        User user = repository
                .findByEmail(request.email())
                .orElseThrow();

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.create(user).getToken();

        return new LoginResponse(accessToken, refreshToken);

    }

    public void logout(User user) {
        // implement logout logic, e.g., revoke the refresh token
        refreshTokenRepository.findByUser(user).ifPresent(refreshTokenService::revoke);
    }

}