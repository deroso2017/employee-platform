package com.ronitech.employee_platform.controller;

import com.ronitech.employee_platform.dto.auth.ChangeRoleRequest;
import com.ronitech.employee_platform.dto.auth.RegisterRequest;
import com.ronitech.employee_platform.dto.auth.RegisterResponse;
import com.ronitech.employee_platform.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class UserController {

  private final UserService service;

  @GetMapping
  public Page<RegisterResponse> getUsers(Pageable pageable) {
    return service.findAll(pageable);
  }

  @GetMapping("/linkable")
  public Page<RegisterResponse> getLinkableUsers(Pageable pageable) {
    return service.findLinkable(pageable);
  }

  @GetMapping("/{id}")
  public RegisterResponse getUser(@PathVariable Long id) {
    return service.findById(id);
  }

  @PutMapping("/{id}")
  public RegisterResponse updateUser(
    @PathVariable Long id,
    @Valid @RequestBody RegisterRequest request
  ) {
    return service.update(id, request);
  }

  @GetMapping("/search")
  public Page<RegisterResponse> search(
    @RequestParam String name,
    Pageable pageable
  ) {
    return service.search(name, pageable);
  }

  @PatchMapping("/{id}/role")
  public ResponseEntity<Void> changeRole(
    @PathVariable Long id,
    @Valid @RequestBody ChangeRoleRequest request
  ) {
    service.changeRole(id, request.role());

    return ResponseEntity.noContent().build();
  }
}
