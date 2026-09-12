package com.ronitech.employee_platform.repository;

import com.ronitech.employee_platform.entity.Employee;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
  Page<Employee> findByFirstNameContainingIgnoreCase(
    String name,
    Pageable pageable
  );

  Optional<Employee> findById(Long id);
  Optional<Employee> findByEmail(String email);
  Optional<Employee> findByEmailIgnoreCase(String email);
}
