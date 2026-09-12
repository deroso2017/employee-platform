package com.ronitech.employee_platform.service;

import com.ronitech.employee_platform.dto.EmployeeResponse;
import com.ronitech.employee_platform.dto.TeamMemberResponse;
import com.ronitech.employee_platform.dto.TeamRequest;
import com.ronitech.employee_platform.dto.TeamResponse;
import com.ronitech.employee_platform.entity.Employee;
import com.ronitech.employee_platform.entity.Team;
import com.ronitech.employee_platform.exception.ResourceNotFoundException;
import com.ronitech.employee_platform.exception.TeamAlreadyExistsException;
import com.ronitech.employee_platform.mapper.TeamMapper;
import com.ronitech.employee_platform.repository.EmployeeRepository;
import com.ronitech.employee_platform.repository.TeamRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class TeamService {

  private final TeamRepository teamRepository;
  private final TeamMapper teamMapper;
  private final EmployeeRepository employeeRepository;

  public TeamResponse create(TeamRequest request) {
    if (teamRepository.existsByNameIgnoreCase(request.name())) {
      throw new TeamAlreadyExistsException(
        "Team already exists: " + request.name()
      );
    }

    Team team = teamMapper.toEntity(request);

    Team savedTeam = teamRepository.save(team);

    return teamMapper.toResponse(savedTeam);
  }

  @Transactional(readOnly = true)
  public List<TeamResponse> findAll() {
    return teamRepository
      .findAll()
      .stream()
      .map(teamMapper::toResponse)
      .toList();
  }

  @Transactional(readOnly = true)
  public TeamResponse findById(Long id) {
    Team team = findTeam(id);

    return teamMapper.toResponse(team);
  }

  public TeamResponse update(Long id, TeamRequest request) {
    Team team = findTeam(id);

    if (
      !team.getName().equalsIgnoreCase(request.name()) &&
      teamRepository.existsByNameIgnoreCase(request.name())
    ) {
      throw new TeamAlreadyExistsException(
        "Team already exists: " + request.name()
      );
    }

    team.setName(request.name());

    return teamMapper.toResponse(team);
  }

  public void delete(Long id) {
    Team team = findTeam(id);

    teamRepository.delete(team);
  }

  private Team findTeam(Long id) {
    return teamRepository
      .findById(id)
      .orElseThrow(() ->
        new ResourceNotFoundException("Team not found: " + id)
      );
  }

  public void addMember(Long teamId, Long employeeId) {
    Team team = findTeam(teamId);

    Employee employee = employeeRepository
      .findById(employeeId)
      .orElseThrow(() ->
        new ResourceNotFoundException("Employee not found: " + employeeId)
      );

    if (!team.getMembers().add(employee)) {
      throw new IllegalStateException(
        "Employee is already a member of this team"
      );
    }
  }

  public void removeMember(Long teamId, Long employeeId) {
    Team team = findTeam(teamId);

    Employee employee = employeeRepository
      .findById(employeeId)
      .orElseThrow(() ->
        new ResourceNotFoundException("Employee not found: " + employeeId)
      );

    boolean wasRemoved = team.getMembers().remove(employee);
    if (!wasRemoved) {
      throw new ResourceNotFoundException(
        "Employee is not a member of this team"
      );
    }
  }

  @Transactional(readOnly = true)
  public List<TeamMemberResponse> findMembers(Long teamId) {
    Team team = findTeam(teamId);

    return team
      .getMembers()
      .stream()
      .map(employee ->
        new TeamMemberResponse(
          employee.getId(),
          employee.getFirstName(),
          employee.getLastName(),
          employee.getEmail()
        )
      )
      .toList();
  }
}
