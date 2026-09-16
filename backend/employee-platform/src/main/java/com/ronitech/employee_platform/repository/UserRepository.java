package com.ronitech.employee_platform.repository;

import com.ronitech.employee_platform.entity.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);
  Page<User> findByEmailContainingIgnoreCase(String email, Pageable pageable);
  boolean existsByEmployeeId(Long employeeId);
}
