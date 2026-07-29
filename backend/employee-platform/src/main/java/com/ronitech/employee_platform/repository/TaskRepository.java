package com.ronitech.employee_platform.repository;

import com.ronitech.employee_platform.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {}
