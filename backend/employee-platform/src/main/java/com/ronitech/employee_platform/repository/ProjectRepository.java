package com.ronitech.employee_platform.repository;

import com.ronitech.employee_platform.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {}
