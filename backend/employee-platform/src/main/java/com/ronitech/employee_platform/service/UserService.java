package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.auth.RegisterRequest;
import com.ronitech.employee_platform.dto.auth.RegisterResponse;
import com.ronitech.employee_platform.entity.User;
import com.ronitech.employee_platform.entity.enums.Role;
import com.ronitech.employee_platform.exception.ResourceNotFoundException;
import com.ronitech.employee_platform.mapper.UserMapper;
import com.ronitech.employee_platform.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

  private final UserRepository userRepository;
  private final UserMapper mapper;
  private final RedisTemplate<String, Object> redisTemplate;

  private String userCacheKey(Long id) {
    return "user:" + id;
  }

  public Page<RegisterResponse> findAll(Pageable pageable) {
    return userRepository.findAll(pageable).map(mapper::toResponse);
  }

  public RegisterResponse findById(Long id) {
    log.debug("Finding user with id: {}", id);

    String key = userCacheKey(id);

    RegisterResponse cached = (RegisterResponse) redisTemplate
      .opsForValue()
      .get(key);

    if (cached != null) {
      return cached;
    }

    User user = userRepository
      .findById(id)
      .orElseThrow(() -> {
        log.warn("User not found: {}", id);
        return new ResourceNotFoundException("User not found with id: " + id);
      });

    RegisterResponse response = mapper.toResponse(user);

    redisTemplate.opsForValue().set(key, response, Duration.ofMinutes(10));

    return response;
  }

  public RegisterResponse update(Long id, RegisterRequest request) {
    User user = userRepository
      .findById(id)
      .orElseThrow(() ->
        new ResourceNotFoundException("User not found with id: " + id)
      );

    user.setEmail(request.email());
    user.setPassword(request.password());

    RegisterResponse response = mapper.toResponse(userRepository.save(user));

    redisTemplate.delete(userCacheKey(id));

    return response;
  }

  public Page<RegisterResponse> search(String email, Pageable pageable) {
    return userRepository
      .findByEmailContainingIgnoreCase(email, pageable)
      .map(mapper::toResponse);
  }

  public void changeRole(Long userId, Role newRole) {
    User user = userRepository
      .findById(userId)
      .orElseThrow(() -> new IllegalArgumentException("User not found"));

    user.setRole(newRole);
  }
}
