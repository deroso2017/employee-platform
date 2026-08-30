package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.auth.LoginRequest;
import com.ronitech.employee_platform.dto.auth.LoginResponse;
import com.ronitech.employee_platform.dto.auth.LogoutRequest;
import com.ronitech.employee_platform.dto.auth.PasswordResetRequest;
import com.ronitech.employee_platform.dto.auth.RefreshRequest;
import com.ronitech.employee_platform.dto.auth.RegisterRequest;
import com.ronitech.employee_platform.dto.auth.RegisterResponse;
import com.ronitech.employee_platform.entity.PasswordResetToken;
import com.ronitech.employee_platform.entity.RefreshToken;
import com.ronitech.employee_platform.entity.User;
import com.ronitech.employee_platform.event.PasswordResetRequestedEvent;
import com.ronitech.employee_platform.event.UserRegisteredEvent;
import com.ronitech.employee_platform.exception.EmailAlreadyExistsException;
import com.ronitech.employee_platform.mapper.UserMapper;
import com.ronitech.employee_platform.publisher.NotificationEventPublisher;
import com.ronitech.employee_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;

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
        private final UserMapper mapper;
        private final PasswordEncoder passwordEncoder;
        private final AuthenticationManager authenticationManager;
        private final JwtService jwtService;
        private final RefreshTokenService refreshTokenService;
        private final NotificationEventPublisher notificationEventPublisher;
        private final PasswordResetService passwordResetService;

        public RegisterResponse register(RegisterRequest request) {

                if (repository.findByEmail(request.email()).isPresent()) {
                        throw new EmailAlreadyExistsException("Email already exists");
                }

                User user = mapper.toEntity(request);

                user.setPassword(
                                passwordEncoder.encode(request.password()));

                User savedUser = repository.save(user);

                notificationEventPublisher.publishUserRegistered(
                                new UserRegisteredEvent(
                                                savedUser.getId(),
                                                savedUser.getEmail()));

                return mapper.toResponse(savedUser);
        }

        public LoginResponse login(LoginRequest request) {

                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.email(),
                                                request.password()));

                User user = repository
                                .findByEmail(request.email())
                                .orElseThrow();

                String accessToken = jwtService.generateAccessToken(user);
                String refreshToken = refreshTokenService.create(user).getToken();

                return new LoginResponse(accessToken, refreshToken);

        }

        public LoginResponse refresh(RefreshRequest request) {

                RefreshToken refreshToken = refreshTokenService.validate(
                                request.refreshToken());

                User user = refreshToken.getUser();

                String accessToken = jwtService.generateAccessToken(user);

                RefreshToken newRefreshToken = refreshTokenService.rotate(refreshToken);

                return new LoginResponse(
                                accessToken,
                                newRefreshToken.getToken()

                );

        }

        public void logout(LogoutRequest request) {

                refreshTokenService.revoke(
                                request.refreshToken());

        }

        public void logoutAll(User user) {

                refreshTokenService.revokeAll(user);

        }

        public void requestPasswordReset(String email) {
                repository.findByEmail(email)
                                .ifPresent(user -> {
                                        String resetToken = passwordResetService.createToken(user);

                                        notificationEventPublisher
                                                        .publishPasswordResetRequested(
                                                                        new PasswordResetRequestedEvent(
                                                                                        user.getId(),
                                                                                        user.getEmail(),
                                                                                        resetToken));
                                });
        }

        @Transactional
        public void resetPassword(
                        PasswordResetRequest request) {

                PasswordResetToken resetToken = passwordResetService.validateToken(
                                request.token());

                User user = resetToken.getUser();

                user.setPassword(
                                passwordEncoder.encode(
                                                request.newPassword()));

                resetToken.markAsUsed();
        }

}