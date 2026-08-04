# Frontend

Frontend for a shift and work-hours tracking application.

Accounts are provisioned by an administrator; the frontend exposes login only.

## Technologies

- React 18
- TypeScript
- Vite
- React Router
- TanStack React Query
- Axios
- CSS Modules
- ESLint

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env` file and set the API base URL:

```bash
VITE_APP_NAME=Timely
VITE_API_URL=http://localhost:8080/api
```

Start the development server:

```bash
npm run dev
```

## Scripts

- `npm run dev` - start the Vite development server
- `npm run build` - type-check and build the production app
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build locally

## Authentication

Authentication uses `HttpOnly` access-token and refresh-token cookies. Axios sends them with
`withCredentials: true`; application code does not read or store either token.

On startup, the current-user query requests `/users/profile`. A `204` response triggers one
`/users/refresh` request followed by another profile request. During normal API usage, a protected
request that returns `401` triggers a refresh and is retried once. Concurrent `401` responses share
the same refresh request.

If the refresh token is missing, expired, or invalid, protected requests redirect to `/login` and
the startup current-user query resolves as unauthenticated.

## Deployment

The app builds to `dist`. The included multi-stage Dockerfile builds the
frontend and serves it through Nginx:

```bash
docker build -t timely-frontend .
docker run --rm -p 3000:80 timely-frontend
```
