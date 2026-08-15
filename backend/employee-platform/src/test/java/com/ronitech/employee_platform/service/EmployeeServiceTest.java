package com.ronitech.employee_platform.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ronitech.employee_platform.dto.EmployeeRequest;
import com.ronitech.employee_platform.dto.EmployeeResponse;
import com.ronitech.employee_platform.entity.Employee;
import com.ronitech.employee_platform.exception.EmployeeNotFoundException;
import com.ronitech.employee_platform.mapper.EmployeeMapper;
import com.ronitech.employee_platform.repository.DepartmentRepository;
import com.ronitech.employee_platform.repository.EmployeeRepository;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private EmployeeMapper mapper;

    @InjectMocks
    private EmployeeService service;

    @Test
    void shouldCreateEmployee() {

        // given
        EmployeeRequest request = new EmployeeRequest(
                "John",
                "Doe",
                "john@test.com");

        Employee employee = new Employee();

        employee.setFirstName("John");
        employee.setLastName("Doe");
        employee.setEmail("john@test.com");

        Employee savedEmployee = new Employee();

        savedEmployee.setId(1L);
        savedEmployee.setFirstName("John");
        savedEmployee.setLastName("Doe");
        savedEmployee.setEmail("john@test.com");

        EmployeeResponse response = new EmployeeResponse(
                1L,
                "John",
                "Doe",
                "john@test.com");

        when(mapper.toEntity(request))
                .thenReturn(employee);

        when(employeeRepository.save(employee))
                .thenReturn(savedEmployee);

        when(mapper.toResponse(savedEmployee))
                .thenReturn(response);

        EmployeeService service = new EmployeeService(
                employeeRepository,
                departmentRepository,
                mapper);

        // when
        EmployeeResponse result = service.create(request);

        // then
        verify(mapper).toEntity(request);

        verify(employeeRepository).save(employee);

        verify(mapper).toResponse(savedEmployee);
    }

    @Test
    void shouldDeleteEmployee() {

        // given
        Long id = 1L;

        Employee employee = new Employee();

        employee.setId(id);
        employee.setFirstName("John");
        employee.setLastName("Doe");
        employee.setEmail("john@test.com");

        when(employeeRepository.findById(id))
                .thenReturn(Optional.of(employee));

        EmployeeService service = new EmployeeService(
                employeeRepository,
                departmentRepository,
                mapper);

        // when
        service.delete(id);

        // then
        verify(employeeRepository).findById(id);

        verify(employeeRepository).delete(employee);
    }

    @Test
    void shouldNotDeleteWhenEmployeeDoesNotExist() {

        Long id = 100L;

        when(employeeRepository.findById(id))
                .thenReturn(Optional.empty());

        EmployeeService service = new EmployeeService(
                employeeRepository,
                departmentRepository,
                mapper);

        assertThrows(
                EmployeeNotFoundException.class,
                () -> service.delete(id));

        verify(employeeRepository).findById(id);

        verify(employeeRepository, never())
                .delete(any(Employee.class));
    }

    @Test
    void shouldUpdateEmployee() {

        // given
        Long id = 1L;

        EmployeeRequest request = new EmployeeRequest(
                "Jane",
                "Smith",
                "jane@test.com");

        Employee employee = new Employee();

        employee.setId(id);
        employee.setFirstName("John");
        employee.setLastName("Doe");
        employee.setEmail("john@test.com");

        EmployeeResponse response = new EmployeeResponse(
                id,
                "Jane",
                "Smith",
                "jane@test.com");

        when(employeeRepository.findById(id))
                .thenReturn(Optional.of(employee));

        when(mapper.toResponse(employee))
                .thenReturn(response);

        // when
        EmployeeResponse result = service.update(id, request);

        // then
        assertEquals("Jane", employee.getFirstName());
        assertEquals("Smith", employee.getLastName());
        assertEquals("jane@test.com", employee.getEmail());

        assertEquals(response, result);

        verify(employeeRepository).findById(id);
        verify(mapper).toResponse(employee);
    }

    @Test
    void shouldThrowExceptionWhenEmployeeNotFound() {

        // given
        Long id = 100L;

        when(employeeRepository.findById(id))
                .thenReturn(Optional.empty());

        EmployeeService service = new EmployeeService(
                employeeRepository,
                departmentRepository,
                mapper);

        // when + then
        assertThrows(
                EmployeeNotFoundException.class,
                () -> service.findById(id));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingUnknownEmployee() {

        // given
        Long id = 100L;

        EmployeeRequest request = new EmployeeRequest(
                "Jane",
                "Smith",
                "jane@test.com");

        when(employeeRepository.findById(id))
                .thenReturn(Optional.empty());

        // when + then
        assertThrows(
                EmployeeNotFoundException.class,
                () -> service.update(id, request));

        verify(employeeRepository).findById(id);

        verify(mapper, never())
                .toResponse(any(Employee.class));
    }

}