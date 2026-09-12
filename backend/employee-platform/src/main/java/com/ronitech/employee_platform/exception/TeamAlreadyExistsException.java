package com.ronitech.employee_platform.exception;

public class TeamAlreadyExistsException extends RuntimeException {

  public TeamAlreadyExistsException(String message) {
    super(message);
  }
}
