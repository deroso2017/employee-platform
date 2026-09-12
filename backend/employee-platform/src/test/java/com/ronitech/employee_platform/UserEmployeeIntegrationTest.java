package com.ronitech.employee_platform;

import com.ronitech.employee_platform.dto.auth.RegisterRequest;
import com.ronitech.employee_platform.dto.auth.RegisterResponse;
import com.ronitech.employee_platform.entity.Employee;
import com.ronitech.employee_platform.entity.User;
import com.ronitech.employee_platform.entity.enums.Role;
import com.ronitech.employee_platform.repository.EmployeeRepository;
import com.ronitech.employee_platform.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class UserEmployeeIntegrationTest {
  // @Autowired
  // private UserRepository userRepository;
  // @Test
  // void userCanExistWithoutEmployee() {
  //     User user = User.builder()
  //         .email("admin@test.com")
  //         .password("encoded-password")
  //         .role(Role.ADMIN)
  //         .build();
  //     User saved = userRepository.save(user);
  //     assertThat(saved.getId()).isNotNull();
  //     assertThat(saved.getEmployee()).isNull();
  // }
  //   @Autowired
  //   private EmployeeRepository employeeRepository;
  //   @Test
  //   void employeeCanExistWithoutUser() {
  //     Employee employee = Employee.builder()
  //       .firstName("John")
  //       .lastName("Doe")
  //       .email("john@company.com")
  //       .build();
  //     Employee saved = employeeRepository.save(employee);
  //     assertThat(saved.getId()).isNotNull();
  //     assertThat(saved.getUser()).isNull();
  //   }
  //   @Test
  //   void userCanBeLinkedToEmployee() {
  //     Employee employee = Employee.builder()
  //       .firstName("John")
  //       .lastName("Doe")
  //       .email("john@company.com")
  //       .build();
  //     employee = employeeRepository.save(employee);
  //     User user = User.builder()
  //       .email("john@login.com")
  //       .password("encoded")
  //       .role(Role.MANAGER)
  //       .employee(employee)
  //       .build();
  //     user = userRepository.save(user);
  //     assertThat(user.getEmployee()).isNotNull();
  //     assertThat(user.getEmployee().getId()).isEqualTo(employee.getId());
  //   }
  //   @Test
  //   void employeeCannotBeLinkedToTwoUsers() {
  //     Employee employee = Employee.builder()
  //       .firstName("John")
  //       .lastName("Doe")
  //       .email("john@company.com")
  //       .build();
  //     employee = employeeRepository.save(employee);
  //     User firstUser = User.builder()
  //       .email("john1@login.com")
  //       .password("encoded")
  //       .role(Role.USER)
  //       .employee(employee)
  //       .build();
  //     userRepository.saveAndFlush(firstUser);
  //     User secondUser = User.builder()
  //       .email("john2@login.com")
  //       .password("encoded")
  //       .role(Role.USER)
  //       .employee(employee)
  //       .build();
  //     assertThatThrownBy(() ->
  //       userRepository.saveAndFlush(secondUser)
  //     ).isNotNull();
  //   }
  //   @Test
  // void registrationCreatesUserWithoutEmployee() {
  //     RegisterRequest request =
  //         new RegisterRequest(
  //             "John",
  //             "Doe",
  //             "john@test.com",
  //             "password123"
  //         );
  //     RegisterResponse response =
  //         authService.register(request);
  //     User user = userRepository
  //         .findByEmail("john@test.com")
  //         .orElseThrow();
  //     assertThat(user.getRole())
  //         .isEqualTo(Role.USER);
  //     assertThat(user.getEmployee())
  //         .isNull();
  // }
}
