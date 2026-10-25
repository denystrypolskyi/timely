# Shift Tracker

A full-stack employee time tracking platform for logging work hours, viewing monthly summaries, and estimating salary.

## Features

- Log in with an administrator-provisioned username and password
- View shifts by month
- Add and delete shifts
- Import shifts from pasted text
- Track total worked time
- Estimate salary from hourly rate

## Local development

PostgreSQL runs in Docker; the backend and frontend run locally with their
normal development servers.

1. Copy `.env.example` to `.env` and set the PostgreSQL credentials.
2. Copy each application's `.env.example` to `.env` in its own directory and
   set the backend secrets.
3. Start PostgreSQL from the repository root:

   ```powershell
   docker compose up -d
   ```

4. Start the backend:

   ```powershell
   cd timely-backend
   .\mvnw.cmd spring-boot:run
   ```

5. In another terminal, start the frontend:

   ```powershell
   cd timely-frontend
   npm run dev
   ```

The application is available at `http://localhost:5173`. Database settings
live only in the root `.env`; backend-only and frontend-only settings remain in
their respective `.env` files. The Dockerfiles are production image builds and
are not used by this local workflow.

## Screenshots


![Login screen](docs/screenshots/login.png)

![Main shifts page](docs/screenshots/shifts.png)

![Add shift modal](docs/screenshots/add-shift-modal.png)

![Selected shift day](docs/screenshots/selected-shift-day.png)

![Settings modal](docs/screenshots/settings.png)

![Import shifts modal](docs/screenshots/import-shifts-modal.png)

