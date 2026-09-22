package com.ronitech.employee_platform.mapper;

import com.ronitech.employee_platform.dto.auth.RegisterRequest;
import com.ronitech.employee_platform.dto.auth.RegisterResponse;
import com.ronitech.employee_platform.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
  componentModel = "spring",
  unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface UserMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "role", ignore = true)
  @Mapping(target = "employee", ignore = true)
  User toEntity(RegisterRequest request);

  RegisterResponse toResponse(User user);
}
