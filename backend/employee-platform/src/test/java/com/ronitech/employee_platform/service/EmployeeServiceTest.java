package com.ronitech.employee_platform.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ronitech.employee_platform.mapper.EmployeeMapper;
import com.ronitech.employee_platform.repository.EmployeeRepository;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository repository;

    @Mock
    private EmployeeMapper mapper;

    @InjectMocks
    private EmployeeService service;

    @Test
    void shouldCreateEmployee() {
        System.out.println("Running shouldCreateEmployee...");
    }

}