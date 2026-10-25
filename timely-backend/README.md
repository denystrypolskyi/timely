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
- Maven
- PostgreSQL database

## Environment

Copy `.env.example` to `.env` and fill in the values:

```env
DB_USERNAME=
DB_URL=
DB_PASSWORD=

FRONTEND_URL=
REGISTRATION_ENABLED=true

JWT_SECRET=
JWT_EXPIRATION_MS=3600000
```
## Run Locally

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

The API runs on port `8080` by default.

## Database migrations

Flyway owns the PostgreSQL schema and Hibernate validates it at startup. The migration directory contains the
baseline schema followed by versioned migrations that update existing databases in order.

The migration history was intentionally reset during development. A database that ran an older migration
chain must be recreated before using this baseline. For the root Docker Compose setup, stop the stack and
remove its database volume, then start it again:

```bash
docker compose down --volumes
docker compose up --build
```

This deletes all data in the Compose-managed PostgreSQL database. For a PostgreSQL instance managed outside
Docker Compose, drop and recreate the application database (or its `public` schema) before starting the app.

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
- `POST /api/users/login` - log in and set the authentication cookie
- `POST /api/users/logout` - clear the authentication cookie
- `GET /api/users/profile` - get the current user profile
- `PATCH /api/users/username` - update username
- `PATCH /api/users/password` - update password
- `PATCH /api/users/timezone` - update the current user's IANA time zone
- `GET /api/shifts/user` - list shifts for the current user
- `POST /api/shifts` - create a shift
- `DELETE /api/shifts/{id}` - delete a shift
- `GET /api/shifts/user/{year}/{month}` - list shifts overlapping a month in the user's time zone

Admin-only endpoints are also available for listing users, deleting users, and listing all shifts.

The monthly shift response includes both `shiftDurationMinutes` (the complete shift) and
`durationInRequestedMonthMinutes` (only the portion inside the requested local calendar month). Use the latter for
monthly time and salary totals. Month intervals are half-open: a shift overlaps when it starts before the next month
and ends after the requested month starts.

## API Docs

With the development profile, Swagger UI is available at:

```text
http://localhost:8080/swagger-ui/index.html
```

Swagger UI and its API document endpoint are disabled in production.

## Authentication Notes
- Login creates one signed JWT containing the user ID and a one-hour expiration by default. The JWT is stored in an
  `HttpOnly`, `SameSite=Strict` cookie and is never stored in local storage or returned in the response body.
- The signing secret stays on the backend in `JWT_SECRET` and must be at least 32 bytes. Production cookies are also
  marked `Secure`, so they are sent only over HTTPS.
- There is no refresh token. When the JWT expires, the user logs in again. Logout clears the browser cookie.
- Login and registration endpoints are rate-limited per client IP.
