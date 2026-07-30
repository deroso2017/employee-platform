-- Create departments table
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Add department reference to employees
ALTER TABLE employees
ADD COLUMN department_id BIGINT;

-- Create foreign key constraint
ALTER TABLE employees
ADD CONSTRAINT fk_employees_department
FOREIGN KEY (department_id)
REFERENCES departments(id);