package com.ronitech.employee_platform.mapper;

import com.ronitech.employee_platform.dto.TeamRequest;
import com.ronitech.employee_platform.dto.TeamResponse;
import com.ronitech.employee_platform.entity.Team;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TeamMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "members", ignore = true)
  Team toEntity(TeamRequest request);

  @Mapping(
    target = "memberCount",
    expression = "java(team.getMembers().size())"
  )
  TeamResponse toResponse(Team team);
}
