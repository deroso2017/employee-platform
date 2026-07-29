package com.ronitech.employee_platform.controller;

import com.ronitech.employee_platform.dto.CredentialRequest;
import com.ronitech.employee_platform.service.CredentialService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees/{employeeId}/credentials")
public class CredentialController {

    private final CredentialService service;

    public CredentialController(CredentialService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setPassword(@PathVariable Long employeeId,
                            @Valid @RequestBody CredentialRequest request) {
        service.setPassword(employeeId, request);
    }

    @PutMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@PathVariable Long employeeId,
                               @Valid @RequestBody CredentialRequest request) {
        service.changePassword(employeeId, request);
    }
}
