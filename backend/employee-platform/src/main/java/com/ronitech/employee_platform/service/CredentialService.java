package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.CredentialRequest;
import com.ronitech.employee_platform.entity.Employee;
import com.ronitech.employee_platform.entity.EmployeeCredential;
import com.ronitech.employee_platform.exception.EmployeeNotFoundException;
import com.ronitech.employee_platform.repository.CredentialRepository;
import com.ronitech.employee_platform.repository.EmployeeRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class CredentialService {

    private final CredentialRepository credentialRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public CredentialService(CredentialRepository credentialRepository,
                             EmployeeRepository employeeRepository,
                             PasswordEncoder passwordEncoder) {
        this.credentialRepository = credentialRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void setPassword(Long employeeId, CredentialRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

        EmployeeCredential credential = credentialRepository.findById(employeeId)
                .orElse(new EmployeeCredential());

        credential.setEmployee(employee);
        credential.setPasswordHash(passwordEncoder.encode(request.password()));
        credentialRepository.save(credential);
    }

    public void changePassword(Long employeeId, CredentialRequest request) {
        EmployeeCredential credential = credentialRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalStateException("No credentials found for employee " + employeeId));

        if (request.oldPassword() == null || !passwordEncoder.matches(request.oldPassword(), credential.getPasswordHash())) {
            throw new IllegalArgumentException("Old password is incorrect.");
        }

        credential.setPasswordHash(passwordEncoder.encode(request.password()));
        credentialRepository.save(credential);
    }
}
