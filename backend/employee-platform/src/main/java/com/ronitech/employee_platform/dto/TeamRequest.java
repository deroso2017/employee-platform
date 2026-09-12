package com.ronitech.employee_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TeamRequest(
        @NotBlank 
        @Size(max = 255) 
        String name

) {
}
