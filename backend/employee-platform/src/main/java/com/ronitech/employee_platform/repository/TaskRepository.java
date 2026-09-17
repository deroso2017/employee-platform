package com.ronitech.employee_platform.repository;

import com.ronitech.employee_platform.entity.Task;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TaskRepository extends JpaRepository<Task, Long> {
  List<Task> findByProjectId(Long projectId);

  List<Task> findByAssigneeIdOrderByIdDesc(Long employeeId);

  @Query(
    """
    select t.status, count(t)
    from Task t
    group by t.status
    """
  )
  List<Object[]> countByStatus();

  @Query(
    """
    select t.priority, count(t)
    from Task t
    group by t.priority
    """
  )
  List<Object[]> countByPriority();

  List<Task> findTop5ByOrderByIdDesc();
}
