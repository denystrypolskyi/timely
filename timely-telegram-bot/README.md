# Telegram Bot

A small Java 17 Telegram client for the shift-tracking backend.

## Code map

- `Main` loads configuration and starts long polling.
- `TelegramBot` checks the owner and routes `/profile`, `/today`, `/month`, `/add`, and `/remove`.
- `BackendClient` contains all HTTP calls to the backend.
- `TelegramMessenger` contains the Telegram send/answer boilerplate.
- `AddShiftHandler` owns the temporary Confirm/Cancel state for `/add`.
- `RemoveShiftHandler` owns the temporary Confirm/Cancel state for `/remove`.
- `AddShiftCommand` parses and formats an add-shift request.
- `MonthReport`, `TodayReport`, and `ShiftText` format shift output.
- Small records such as `Shift` only hold data.

The normal flow is:

```text
Telegram update -> TelegramBot -> BackendClient -> backend
                          |
                          +-> TelegramMessenger -> Telegram reply
```

## Local configuration

Copy `.env.example` to `.env` and fill in the values. `.env` is ignored by Git.

```env
BOT_DISPLAY_NAME=Shift Tracker
TELEGRAM_BOT_TOKEN=
TELEGRAM_ALLOWED_USER_ID=
BACKEND_URL=http://localhost:8080
BOT_TIME_ZONE=Europe/Warsaw
BACKEND_USERNAME=
BACKEND_PASSWORD=
```

## Run and test

Run `Main` from IntelliJ, or execute:

```powershell
mvn test
```

## Docker

From the repository root, build and start the backend and bot:

```powershell
docker compose up --build -d
```

The bot has no public port. Inside Docker it reaches the backend at
`http://backend:8080`.
