package com.ronitech.employee_platform.controller;

import com.ronitech.employee_platform.dto.EmployeeResponse;
import com.ronitech.employee_platform.dto.auth.ChangeRoleRequest;
import com.ronitech.employee_platform.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

  private final EmployeeService service;

  @PreAuthorize("hasAuthority('ADMIN')")
  @PatchMapping("/{id}/role")
  public ResponseEntity<Void> changeRole(
    @PathVariable Long id,
    @Valid @RequestBody ChangeRoleRequest request
  ) {
    service.changeRole(id, request.role());

    return ResponseEntity.noContent().build();
  }
}
