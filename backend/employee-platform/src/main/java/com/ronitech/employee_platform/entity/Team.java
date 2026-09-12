package com.ronitech.employee_platform.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import lombok.*;

@Entity
@Table(name = "teams")
@Data // Replaces @Getter, @Setter, @ToString, @EqualsAndHashCode
@Builder // Enables Team.builder()
@NoArgsConstructor // Mandatory for JPA/Hibernate to instantiate objects
@AllArgsConstructor // Mandatory for @Builder to work properly
public class Team {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @ManyToMany
  @JoinTable(
    name = "team_members",
    joinColumns = @JoinColumn(name = "team_id"),
    inverseJoinColumns = @JoinColumn(name = "employee_id")
  )
  @Builder.Default
  private Set<Employee> members = new HashSet<>();
}
