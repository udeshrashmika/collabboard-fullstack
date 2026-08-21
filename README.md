# CollabBoard

CollabBoard is a real-time collaborative task management system built as a full-stack group project.

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Socket.io Client

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Socket.io

### Testing
- Vitest / React Testing Library
- Jest / Supertest

### DevOps
- GitHub Actions
- Docker
- Docker Compose

## Repository Structure

```text
collabboard-fullstack/
├── client/
├── server/
├── docs/
├── .github/workflows/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

## Branch Strategy

- `main` — stable releases
- `develop` — integration branch
- `feature/*` — features
- `test/*` — testing
- `docs/*` — documentation
- `chore/*` — configuration and DevOps

## Local Development

Frontend:

```bash
cd client
npm install
npm run dev
```

Backend:

```bash
cd server
npm install
npm run dev
```
