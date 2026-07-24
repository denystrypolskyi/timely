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

## Deployment

The app builds to `dist`. The included multi-stage Dockerfile builds the
frontend and serves it through Nginx:

```bash
docker build -t timely-frontend .
docker run --rm -p 3000:80 timely-frontend
```
