package com.ronitech.employee_platform.controller;

import com.ronitech.employee_platform.dto.TeamMemberResponse;
import com.ronitech.employee_platform.dto.TeamRequest;
import com.ronitech.employee_platform.dto.TeamResponse;
import com.ronitech.employee_platform.service.TeamService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

  private final TeamService teamService;

  @PostMapping
  @PreAuthorize("hasAnyAuthority('ADMIN','MANAGER')")
  @ResponseStatus(HttpStatus.CREATED)
  public TeamResponse create(@Valid @RequestBody TeamRequest request) {
    return teamService.create(request);
  }

  @GetMapping
  public List<TeamResponse> findAll() {
    return teamService.findAll();
  }

  @GetMapping("/{id}")
  public TeamResponse findById(@PathVariable Long id) {
    return teamService.findById(id);
  }

  @PatchMapping("/{id}")
  @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN')")
  public TeamResponse update(
    @PathVariable Long id,
    @Valid @RequestBody TeamRequest request
  ) {
    return teamService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    teamService.delete(id);
  }

  @PostMapping("/{teamId}/members/{employeeId}")
  @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void addMember(
    @PathVariable Long teamId,
    @PathVariable Long employeeId
  ) {
    teamService.addMember(teamId, employeeId);
  }

  @DeleteMapping("/{teamId}/members/{employeeId}")
  @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void removeMember(
    @PathVariable Long teamId,
    @PathVariable Long employeeId
  ) {
    teamService.removeMember(teamId, employeeId);
  }

  @GetMapping("/{teamId}/members")
  public List<TeamMemberResponse> findMembers(@PathVariable Long teamId) {
    return teamService.findMembers(teamId);
  }
}
