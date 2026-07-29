package com.ronitech.employee_platform.repository;

import com.ronitech.employee_platform.entity.EmployeeCredential;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CredentialRepository extends JpaRepository<EmployeeCredential, Long> {}
