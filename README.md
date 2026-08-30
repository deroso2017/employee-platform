<div align="center">

<img src="https://img.icons8.com/fluency/96/organization.png" alt="Employee Platform Logo" width="96" />

# Employee Platform

**A modern, full-stack employee management system built with Spring Boot and Next.js**

[![Backend CI](https://img.shields.io/github/actions/workflow/status/ronitech/employee-platform/backend-ci.yml?branch=main&label=Backend%20CI&logo=github-actions&logoColor=white&style=flat-square)](https://github.com)
[![Java](https://img.shields.io/badge/Java-22-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.0-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg?style=flat-square)](LICENSE)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Project Structure](#-project-structure)

</div>

---

## 📋 Overview

Employee Platform is a **production-ready, full-stack web application** for managing employees and departments within an organization. It features a secure JWT-based authentication system with role-based access control, event-driven notifications via RabbitMQ, Redis-backed token caching, and a polished Next.js frontend with Tailwind CSS and shadcn/ui components.

---

## ✨ Features

| Feature                           | Description                                                       |
| --------------------------------- | ----------------------------------------------------------------- |
| 🔐 **JWT Authentication**         | Secure login/register with access tokens + refresh tokens         |
| 🔄 **Token Refresh**              | Automatic silent token renewal with interceptor logic             |
| 🛡️ **Role-Based Access**          | Fine-grained permissions for `ADMIN`, `MANAGER`, and `USER` roles |
| 👥 **Employee Management**        | Full CRUD with server-side pagination and name search             |
| 🏢 **Department Management**      | Create, update, delete, and assign departments to employees       |
| 🖼️ **Profile Image Upload**       | Upload and serve per-employee profile images                      |
| 📧 **Password Reset**             | Secure email-based password reset flow with expiring tokens       |
| 📨 **Event-Driven Notifications** | RabbitMQ-powered async event publishing and consuming             |
| ⚡ **Redis Caching**              | Fast refresh token storage and blacklisting via Redis             |
| 📖 **OpenAPI / Swagger UI**       | Interactive API docs at `/swagger-ui.html`                        |
| 📊 **Spring Actuator**            | Health checks and application metrics endpoints                   |
| 🐳 **Docker Compose**             | One-command infrastructure setup for all services                 |
| 🤖 **GitHub Actions CI**          | Automated test and build pipeline on every push                   |

---

## 🛠️ Tech Stack

### Backend

<table>
  <tr>
    <td align="center" width="100">
      <img src="https://img.shields.io/badge/-Java%2022-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" /><br/>Java 22
    </td>
    <td align="center" width="140">
      <img src="https://img.shields.io/badge/-Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" /><br/>Spring Boot 4.1
    </td>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-Spring%20Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white" /><br/>Security
    </td>
    <td align="center" width="100">
      <img src="https://img.shields.io/badge/-Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white" /><br/>Gradle
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://img.shields.io/badge/-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" /><br/>PostgreSQL
    </td>
    <td align="center">
      <img src="https://img.shields.io/badge/-Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" /><br/>Redis 7
    </td>
    <td align="center">
      <img src="https://img.shields.io/badge/-RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white" /><br/>RabbitMQ 4
    </td>
    <td align="center">
      <img src="https://img.shields.io/badge/-Flyway-CC0200?style=for-the-badge&logo=flyway&logoColor=white" /><br/>Flyway
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://img.shields.io/badge/-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" /><br/>JJWT 0.12
    </td>
    <td align="center">
      <img src="https://img.shields.io/badge/-MapStruct-EE4C2C?style=for-the-badge" /><br/>MapStruct 1.6
    </td>
    <td align="center">
      <img src="https://img.shields.io/badge/-Lombok-red?style=for-the-badge" /><br/>Lombok
    </td>
    <td align="center">
      <img src="https://img.shields.io/badge/-OpenAPI-6BA539?style=for-the-badge&logo=openapiinitiative&logoColor=white" /><br/>Swagger UI
    </td>
  </tr>
</table>

### Frontend

<table>
  <tr>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" /><br/>Next.js 16.3
    </td>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black" /><br/>React 19
    </td>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" /><br/>TypeScript 5
    </td>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" /><br/>Tailwind v4
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://img.shields.io/badge/-shadcn/ui-000000?style=for-the-badge" /><br/>shadcn/ui
    </td>
    <td align="center">
      <img src="https://img.shields.io/badge/-Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" /><br/>Axios 1.19
    </td>
    <td align="center">
      <img src="https://img.shields.io/badge/-Lucide-F56565?style=for-the-badge" /><br/>Lucide Icons
    </td>
    <td align="center">
      <img src="https://img.shields.io/badge/-jwt--decode-000000?style=for-the-badge" /><br/>jwt-decode 4
    </td>
  </tr>
</table>

### Infrastructure & DevOps

<table>
  <tr>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" /><br/>Docker
    </td>
    <td align="center" width="140">
      <img src="https://img.shields.io/badge/-Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" /><br/>Docker Compose
    </td>
    <td align="center" width="140">
      <img src="https://img.shields.io/badge/-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" /><br/>GitHub Actions
    </td>
  </tr>
</table>

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                    Next.js 16 (React 19)                     │
│              Tailwind CSS v4 + shadcn/ui                     │
│           Pages: /login · /register · /dashboard             │
│                     /departments                             │
└──────────────────────┬───────────────────────────────────────┘
                       │  HTTP/REST (Axios + JWT Bearer)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                  Spring Boot 4.1 (Java 22)                   │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────────┐ │
│  │ AuthCtrl   │  │EmployeeCtrl│  │  DepartmentController   │ │
│  │ /api/auth  │  │/api/empl.. │  │  /api/departments       │ │
│  └─────┬──────┘  └─────┬──────┘  └──────────┬──────────────┘ │
│        │               │                     │               │
│  ┌─────▼───────────────▼─────────────────────▼──────────────┐│
│  │            Service Layer (Business Logic)                ││
│  │  AuthService · EmployeeService · DepartmentService       ││
│  │  JwtService · RefreshTokenService · PasswordResetService ││
│  └─────┬────────────────────────┬──────────────────────┬────┘│
│        │                        │                      │     │
│  ┌─────▼──────┐  ┌──────────────▼──────┐    ┌──────────▼────┐│
│  │JPA Repos   │  │ RabbitMQ Publishers │    │  Redis Cache  ││
│  │(Hibernate) │  │  & Consumers        │    │  (Tokens)     ││
│  └─────┬──────┘  └──────────────┬──────┘    └───────────────┘│
└────────│──────────────────────── │───────────────────────────┘
         │                         │
         ▼                         ▼
   ┌─────────────┐         ┌──────────────┐
   │ PostgreSQL  │         │  RabbitMQ    │
   │ (Flyway     │         │  Exchange &  │
   │  Migrations)│         │  Queues      │
   └─────────────┘         └──────────────┘
```

### Security Flow

```
Client ──── POST /api/auth/login ──────────────────► AuthController
                                                           │
                                           ┌───────────────▼──────────────┐
                                           │  Validate credentials        │
                                           │  Generate Access Token (JWT) │
                                           │  Generate Refresh Token      │
                                           │  Store Refresh Token → Redis │
                                           └───────────────┬──────────────┘
                                                           │
Client ◄─── { accessToken, refreshToken } ────────────────┘

Client ──── Bearer <accessToken> ────────────────────► JwtAuthenticationFilter
                                                               │
                                               ┌───────────────▼──────────┐
                                               │  Validate & decode JWT   │
                                               │  Check role permissions  │
                                               │  (@PreAuthorize)         │
                                               └──────────────────────────┘

Client ──── POST /api/auth/refresh ──────────────────► Validate via Redis
                                                        Issue new token pair
```

### Event-Driven Flow (RabbitMQ)

```
EmployeeService  ──publish──►  EmployeeEventPublisher
AuthService      ──publish──►  NotificationEventPublisher
                                        │
                               RabbitMQ Exchange
                                        │
                      ┌─────────────────┴──────────────────┐
                      ▼                                    ▼
             EmployeeEventConsumer           NotificationEventConsumer
             (log / process events)          (send emails / alerts)
```

---

## 🚀 Getting Started

### Prerequisites

- **Java 22** (Temurin recommended)
- **Gradle** (wrapper included)
- **Node.js 20+** and **npm**
- **Docker & Docker Compose**

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/employee-platform.git
cd employee-platform
```

---

### 2. Start Infrastructure (Docker)

From the `backend/employee-platform` directory, spin up PostgreSQL, Redis, and RabbitMQ:

```bash
cd backend/employee-platform
docker compose up -d
```

This starts:
| Service | Port |
|---|---|
| PostgreSQL 17 | `5432` |
| Redis 7 | `6379` |
| RabbitMQ 4 (+ Management UI) | `5672` / `15672` |

---

### 3. Configure the Backend

Copy the example environment file and configure your settings:

```bash
cp backend/employee-platform/.env.example backend/employee-platform/.env
```

Edit `backend/employee-platform/.env`:

```env
# Database
DB_URL=jdbc:postgresql://localhost:5432/employee_platform
DB_USERNAME=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-very-long-secret-key-here
JWT_EXPIRATION=900000           # 15 minutes (ms)
REFRESH_EXPIRATION=2592000000   # 30 days (ms)

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_PORT=5672

# Mail (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Password Reset
PASSWORD_RESET_EXPIRATION_MINUTES=30
```

---

### 4. Run the Backend

```bash
cd backend/employee-platform
./gradlew bootRun
```

The API will be available at **`http://localhost:8080`**

Swagger UI: **`http://localhost:8080/swagger-ui.html`**

---

### 5. Configure the Frontend

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

### 6. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at **`http://localhost:3000`**

---

### 7. Build Backend Docker Image (Optional)

```bash
cd backend/employee-platform
./gradlew build
docker build -t employee-platform-backend .
```

---

## 📡 API Reference

### Authentication `/api/auth`

| Method | Endpoint                    | Access        | Description                  |
| ------ | --------------------------- | ------------- | ---------------------------- |
| `POST` | `/api/auth/register`        | Public        | Register a new user          |
| `POST` | `/api/auth/login`           | Public        | Login and receive JWT tokens |
| `POST` | `/api/auth/logout`          | Authenticated | Revoke refresh token         |
| `POST` | `/api/auth/refresh`         | Public        | Refresh access token         |
| `GET`  | `/api/auth/profile`         | Authenticated | Get current user profile     |
| `POST` | `/api/auth/forgot-password` | Public        | Request password reset email |
| `POST` | `/api/auth/reset-password`  | Public        | Reset password with token    |

### Employees `/api/employees`

| Method   | Endpoint                                  | Access          | Description                |
| -------- | ----------------------------------------- | --------------- | -------------------------- |
| `GET`    | `/api/employees`                          | Authenticated   | List employees (paginated) |
| `GET`    | `/api/employees/{id}`                     | Authenticated   | Get employee by ID         |
| `GET`    | `/api/employees/search?name=`             | Authenticated   | Search by name (paginated) |
| `POST`   | `/api/employees`                          | ADMIN / MANAGER | Create new employee        |
| `PUT`    | `/api/employees/{id}`                     | ADMIN           | Update employee            |
| `DELETE` | `/api/employees/{id}`                     | ADMIN           | Delete employee            |
| `PUT`    | `/api/employees/{id}/department/{deptId}` | Authenticated   | Assign department          |
| `POST`   | `/api/employees/{id}/profile-image`       | Authenticated   | Upload profile image       |
| `GET`    | `/api/employees/{id}/profile-image`       | Authenticated   | Get profile image          |

### Departments `/api/departments`

| Method   | Endpoint                | Access        | Description          |
| -------- | ----------------------- | ------------- | -------------------- |
| `GET`    | `/api/departments`      | Authenticated | List all departments |
| `POST`   | `/api/departments`      | Authenticated | Create department    |
| `PUT`    | `/api/departments/{id}` | Authenticated | Update department    |
| `DELETE` | `/api/departments/{id}` | Authenticated | Delete department    |

### Role Permissions Summary

```
ADMIN   →  Full access (read, create, update, delete)
MANAGER →  Read + create employees
USER    →  Read only
```

---

## 📁 Project Structure

```
employee-platform/
├── backend/
│   └── employee-platform/
│       ├── src/
│       │   └── main/java/com/ronitech/employee_platform/
│       │       ├── config/          # Security, CORS, Redis, RabbitMQ, OpenAPI
│       │       ├── controller/      # REST controllers (Auth, Employee, Department)
│       │       ├── consumer/        # RabbitMQ message consumers
│       │       ├── dto/             # Request/Response DTOs
│       │       │   └── auth/        # Auth-specific DTOs
│       │       ├── entity/          # JPA entities (User, Employee, Department, …)
│       │       ├── event/           # Domain event records
│       │       ├── exception/       # Custom exceptions + GlobalExceptionHandler
│       │       ├── mapper/          # MapStruct mappers
│       │       ├── publisher/       # RabbitMQ event publishers
│       │       ├── repository/      # Spring Data JPA repositories
│       │       ├── security/        # JwtAuthenticationFilter
│       │       └── service/         # Business logic services
│       ├── .env                     # Local environment variables
│       ├── .env.production          # Production environment variables
│       ├── build.gradle             # Gradle build configuration
│       ├── docker-compose.yml       # Infrastructure services
│       ├── Dockerfile               # Backend container definition
│       └── .github/
│           └── workflows/
│               └── backend-ci.yml  # GitHub Actions CI pipeline
│
└── frontend/
    └── src/
        ├── app/                     # Next.js App Router pages
        │   ├── login/               # Login page
        │   ├── register/            # Registration page
        │   ├── dashboard/           # Employee management dashboard
        │   └── departments/         # Department management page
        ├── components/
        │   ├── employees/           # EmployeeFormDialog
        │   ├── departments/         # Department components
        │   ├── layout/              # Navbar, layout components
        │   └── ui/                  # shadcn/ui components
        ├── context/
        │   └── AuthContext.tsx      # Global auth state
        ├── lib/
        │   ├── api.ts               # Axios client + interceptors
        │   ├── auth.ts              # Token storage helpers
        │   ├── types.ts             # TypeScript interfaces
        │   └── utils.ts             # Utility functions
        └── middleware.ts            # Next.js auth middleware
```

---

## 🧪 Running Tests

### Backend

```bash
cd backend/employee-platform
./gradlew test
```

Tests use H2 in-memory database and Spring Security Test. Test output (passed/failed/skipped) is displayed in the console.

### Frontend

```bash
cd frontend
npm run lint
```

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/backend-ci.yml`) runs on every push to `main` or `develop` and on pull requests to `main`:

```
push/PR ──► Checkout ──► Setup Java 22 (Temurin) ──► Run Tests ──► Build JAR
```

---

## 🐳 Docker Infrastructure Details

| Container           | Image                   | Port(s)         |
| ------------------- | ----------------------- | --------------- |
| `employee-postgres` | `postgres:17`           | `5432`          |
| `employee-redis`    | `redis:7`               | `6379`          |
| `employee-rabbitmq` | `rabbitmq:4-management` | `5672`, `15672` |

Access the **RabbitMQ Management UI** at `http://localhost:15672` (default: `guest` / `guest`)

---

## ⚙️ Environment Variables

### Backend (`.env`)

| Variable                            | Description                       | Default                                              |
| ----------------------------------- | --------------------------------- | ---------------------------------------------------- |
| `DB_URL`                            | PostgreSQL JDBC connection URL    | `jdbc:postgresql://localhost:5432/employee_platform` |
| `DB_USERNAME`                       | Database username                 | `postgres`                                           |
| `DB_PASSWORD`                       | Database password                 | `postgres`                                           |
| `JWT_SECRET`                        | Secret key for signing JWTs       | —                                                    |
| `JWT_EXPIRATION`                    | Access token TTL in milliseconds  | `900000` (15 min)                                    |
| `REFRESH_EXPIRATION`                | Refresh token TTL in milliseconds | `2592000000` (30 days)                               |
| `REDIS_HOST`                        | Redis hostname                    | `localhost`                                          |
| `REDIS_PORT`                        | Redis port                        | `6379`                                               |
| `RABBITMQ_HOST`                     | RabbitMQ hostname                 | `localhost`                                          |
| `RABBITMQ_USERNAME`                 | RabbitMQ username                 | `guest`                                              |
| `RABBITMQ_PASSWORD`                 | RabbitMQ password                 | `guest`                                              |
| `RABBITMQ_PORT`                     | RabbitMQ AMQP port                | `5672`                                               |
| `MAIL_HOST`                         | SMTP host                         | `smtp.gmail.com`                                     |
| `MAIL_PORT`                         | SMTP port                         | `587`                                                |
| `MAIL_USERNAME`                     | Sender email address              | —                                                    |
| `MAIL_PASSWORD`                     | SMTP password / app password      | —                                                    |
| `PASSWORD_RESET_EXPIRATION_MINUTES` | Password reset token validity     | `30`                                                 |

### Frontend (`.env.local`)

| Variable              | Description                         |
| --------------------- | ----------------------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of the Spring Boot backend |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is **proprietary and all rights reserved**. No part of this codebase may be used, copied, modified, merged, published, distributed, sublicensed, or sold without explicit written permission from the author.

See the [LICENSE](LICENSE) file for full terms.

---

<div align="center">

Made with ☕ and Java

**[⬆ Back to top](#employee-platform)**

</div>
