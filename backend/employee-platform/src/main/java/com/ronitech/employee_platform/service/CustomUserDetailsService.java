package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService
        implements UserDetailsService {

    private final UserRepository repository;

    @Override
    public UserDetails loadUserByUsername(
            String username) throws UsernameNotFoundException {

        return repository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found"));
    }

}