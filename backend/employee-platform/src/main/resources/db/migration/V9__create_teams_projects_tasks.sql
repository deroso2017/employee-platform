CREATE TABLE teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE team_members (
    team_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,

    CONSTRAINT pk_team_members
        PRIMARY KEY (team_id, employee_id),

    CONSTRAINT fk_team_members_team
        FOREIGN KEY (team_id)
        REFERENCES teams(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_team_members_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_team_members_employee_id
    ON team_members(employee_id);


CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED',
    team_id BIGINT NOT NULL,
    manager_id BIGINT NOT NULL,

    CONSTRAINT fk_projects_team
        FOREIGN KEY (team_id)
        REFERENCES teams(id),

    CONSTRAINT fk_projects_manager
        FOREIGN KEY (manager_id)
        REFERENCES employees(id)
);

CREATE INDEX idx_projects_team_id
    ON projects(team_id);

CREATE INDEX idx_projects_manager_id
    ON projects(manager_id);

CREATE INDEX idx_projects_status
    ON projects(status);


CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(5000),
    status VARCHAR(50) NOT NULL DEFAULT 'TODO',
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    project_id BIGINT NOT NULL,
    assignee_id BIGINT,

    CONSTRAINT fk_tasks_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_tasks_assignee
        FOREIGN KEY (assignee_id)
        REFERENCES employees(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_tasks_project_id
    ON tasks(project_id);

CREATE INDEX idx_tasks_assignee_id
    ON tasks(assignee_id);

CREATE INDEX idx_tasks_status
    ON tasks(status);

CREATE INDEX idx_tasks_priority
    ON tasks(priority);