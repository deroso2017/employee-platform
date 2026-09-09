package com.ronitech.employee_platform.entity;

import com.ronitech.employee_platform.entity.enums.TaskPriority;
import com.ronitech.employee_platform.entity.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(length = 5000)
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @Builder.Default
  private TaskStatus status = TaskStatus.TODO;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @Builder.Default
  private TaskPriority priority = TaskPriority.MEDIUM;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "assignee_id")
  private Employee assignee;
}
