package com.ronitech.employee_platform.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "employee_credentials")
@Data
public class EmployeeCredential {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Column(nullable = false)
    private String passwordHash;
}
