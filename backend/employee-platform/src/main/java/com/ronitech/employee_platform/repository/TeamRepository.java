package com.ronitech.employee_platform.repository;

import com.ronitech.employee_platform.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, Long> {
  boolean existsByNameIgnoreCase(String name);
}
