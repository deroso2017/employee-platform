package com.ronitech.employee_platform.controller;

import com.ronitech.employee_platform.dto.EmployeeRequest;
import com.ronitech.employee_platform.dto.EmployeeResponse;
import com.ronitech.employee_platform.dto.FileResponse;
import com.ronitech.employee_platform.service.EmployeeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.parameters.RequestBody;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

import java.io.IOException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    @GetMapping
    public Page<EmployeeResponse> getEmployees(Pageable pageable) {

        return service.findAll(pageable);
    }

    @GetMapping("/{id}")
    public EmployeeResponse getEmployee(
            @PathVariable Long id) {

        return service.findById(id);

    }

    @PreAuthorize("hasAnyAuthority('ADMIN','MANAGER')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeResponse createEmployee(
            @Valid @RequestBody EmployeeRequest request) {

        return service.create(request);

    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public EmployeeResponse updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request) {

        return service.update(id, request);

    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteEmployee(
            @PathVariable Long id) {

        service.delete(id);

    }

    @GetMapping("/search")
    public Page<EmployeeResponse> search(
            @RequestParam String name,
            Pageable pageable) {

        return service.search(
                name,
                pageable);

    }

    @PutMapping("/{employeeId}/department/{departmentId}")
    public EmployeeResponse assignDepartment(
            @PathVariable Long employeeId,
            @PathVariable Long departmentId) {

        return service.assignDepartment(
                employeeId,
                departmentId);

    }

    @Operation(summary = "Upload profile image")
    @RequestBody(content = @Content(mediaType = "multipart/form-data"))
    @PostMapping(value = "/{id}/profile-image", consumes = "multipart/form-data")
    public EmployeeResponse uploadProfileImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file)
            throws IOException {

        return service.uploadProfileImage(
                id,
                file);
    }

    @GetMapping("/{id}/profile-image")
    public ResponseEntity<byte[]> getProfileImage(
            @PathVariable Long id)
            throws IOException {

        FileResponse file = service.getProfileImage(id);

        return ResponseEntity
                .ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .body(file.data());
    }

}
