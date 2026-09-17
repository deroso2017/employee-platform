package com.ronitech.employee_platform.controller;

import com.ronitech.employee_platform.dto.DashboardResponse;
import com.ronitech.employee_platform.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

  private final DashboardService dashboardService;

  @GetMapping
  @PreAuthorize("isAuthenticated()")
  public DashboardResponse getDashboard() {
    return dashboardService.getDashboard();
  }
}
