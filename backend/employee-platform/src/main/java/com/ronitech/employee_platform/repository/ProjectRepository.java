package com.ronitech.employee_platform.repository;

import com.ronitech.employee_platform.entity.Project;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProjectRepository extends JpaRepository<Project, Long> {
  @Query(
    """
    select p.status, count(p)
    from Project p
    group by p.status
    """
  )
  List<Object[]> countByStatus();

  List<Project> findTop5ByOrderByIdDesc();
}
