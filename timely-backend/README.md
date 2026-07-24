# Backend

Backend API for a shift-tracking application. It handles user registration and login, JWT authentication, profile updates, and shift management.

## Technologies

- Java 17
- Spring Boot 3.5
- Spring Web
- Spring Data JPA / Hibernate
- Spring Security
- JWT with `jjwt`
- PostgreSQL
- Flyway database migrations
- springdoc OpenAPI / Swagger UI
- Lombok
- Maven
- JUnit 5 / Mockito
- Docker

## Requirements

- Java 17+
- Maven, or the included Maven wrapper
- PostgreSQL database

## Environment

Copy `.env.example` to `.env` and fill in the values:

```env
DB_USERNAME=
DB_URL=
DB_PASSWORD=

FRONTEND_URL=
REGISTRATION_ENABLED=false

JWT_SECRET=
JWT_EXPIRATION_MS=3600000
```

`JWT_SECRET` must be a random value of at least 32 bytes. Keep it out of Git and back it up with the rest of your VPS secrets.

The application uses the `dev` Spring profile by default. The production profile disables public registration, Swagger UI, and API docs unless explicitly configured. Keep registration disabled after creating the accounts you need.

## Run Locally

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

The API runs on port `8080` by default.

## Tests

```bash
./mvnw test
```

On Windows:

```powershell
.\mvnw.cmd test
```

## Docker

Build the image:

```bash
docker build -t shift-backend .
```

Run the container:

```bash
docker run --env-file .env -p 8080:8080 shift-backend
```

## API Overview

Main API groups:

- `POST /api/users/register` - create a user
- `POST /api/users/login` - log in and receive a JWT
- `GET /api/users/profile` - get the current user profile
- `PATCH /api/users/username` - update username
- `PATCH /api/users/password` - update password
- `GET /api/shifts/user` - list shifts for the current user
- `POST /api/shifts` - create a shift
- `DELETE /api/shifts/{id}` - delete a shift
- `GET /api/shifts/user/{year}/{month}` - list current user shifts for a month

Admin-only endpoints are also available for listing users, deleting users, and listing all shifts.

## API Docs

With the development profile, Swagger UI is available at:

```text
http://localhost:8080/swagger-ui/index.html
```

Swagger UI and its API document endpoint are disabled in production.

## Authentication Notes

- Passwords must contain 12-72 characters and fit within bcrypt's 72-byte input limit.
- JWTs expire after one hour by default. Changing a password immediately invalidates previously issued JWTs.
- Login and registration endpoints are rate-limited per client IP.
