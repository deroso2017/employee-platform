package com.ronitech.employee_platform.exception;

public class DepartmentNotFoundException extends RuntimeException {

    public DepartmentNotFoundException(Long id) {
        super("Department with id " + id + " not found.");
    }

}
