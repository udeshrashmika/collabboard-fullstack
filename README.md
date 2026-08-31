# CollabBoard

A collaborative Kanban task board built as a full-stack group project. Users register, create boards, add tasks, and move those tasks through To&nbsp;Do, Doing and Done columns.

React + Vite on the front, Node.js + Express + MongoDB on the back, JWT for authentication.

---

## Contents

- [Project status](#project-status)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [API reference](#api-reference)
- [Data models](#data-models)
- [Authentication](#authentication)
- [Frontend architecture](#frontend-architecture)
- [Testing](#testing)
- [Continuous integration](#continuous-integration)
- [Branch strategy](#branch-strategy)
- [Team](#team)
- [Known issues](#known-issues)
- [Roadmap](#roadmap)

---

## Project status

The project is built in stages. This table reflects what is actually working today, not what is planned.

| Area | Status | Notes |
| --- | --- | --- |
| React UI | Working | All screens built: auth, dashboard, Kanban board, modals |
| Authentication | Working | Register, login, JWT, password reset — end to end |
| Task API | Working | Full CRUD plus a move endpoint, with validation |
| Board API | Partial | Only `GET` and `POST`. No update or delete route |
| Column API | Partial | Only `GET` and `POST`. No update, delete, or by-board query |
| Route protection | Partial | Auth routes are guarded; board, column and task routes are not |
| MongoDB persistence | Working | Users and tasks persist. Board fields are partly dropped |
| Client ↔ API wiring | Partial | Auth screens call the API. Boards and tasks still use localStorage |
| Real-time (Socket.io) | Scaffolded | Server accepts connections but no events are emitted |
| Tests | Minimal | One server test. No client tests yet |
| CI | Working | GitHub Actions builds the client and runs server tests |
| Docker | Written | Compose file and Dockerfiles exist, not yet verified end to end |

See [Known issues](#known-issues) for the specific gaps.

---

## Tech stack

**Frontend**

- React 19
- Vite 7
- React Router 7
- Axios
- Socket.io Client
- Plain CSS with custom properties (no framework)

**Backend**

- Node.js with ES modules
- Express 5
- MongoDB with Mongoose 8
- jsonwebtoken
- bcryptjs
- Nodemailer
- Socket.io

**Tooling**

- Vitest, React Testing Library, jsdom (client)
- Jest, Supertest (server)
- GitHub Actions
- Docker, Docker Compose

---

## Repository structure

```text
collabboard-fullstack/
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   ├── apiClient.js        Axios instance, token interceptors
│   │   │   ├── board.js            Board API calls
│   │   │   └── column.js           Column API calls
│   │   ├── components/
│   │   │   ├── auth/               AuthDecor, PasswordInput, EditAccountModal
│   │   │   ├── common/             Button, ConfirmDialog
│   │   │   ├── layout/             AppLayout, AccountMenu
│   │   │   ├── dashboard/          Dashboard, BoardCard, BoardModal
│   │   │   ├── kanban/             KanbanBoard, TaskCard, TaskModal
│   │   │   ├── AuthContext.jsx     Auth state, talks to the API
│   │   │   ├── BoardsContext.jsx   Board state
│   │   │   ├── TasksContext.jsx    Task state
│   │   │   ├── HistoryContext.jsx  Recently opened boards
│   │   │   ├── ProtectedRoute.jsx  Route guard
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── App.jsx                 Routes and provider tree
│   │   ├── index.css               All application styles
│   │   └── main.jsx
│   ├── Dockerfile
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── db.js                   Mongoose connection
│   ├── models/                     Mongoose schemas
│   │   ├── User.js
│   │   ├── Board.js
│   │   ├── Column.js
│   │   └── Task.js
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── boardController.js
│   │   │   ├── columnController.js
│   │   │   └── taskController.js
│   │   ├── middleware/
│   │   │   └── auth.js             JWT verification
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── boardRoutes.js
│   │   │   ├── columnRoutes.js
│   │   │   └── taskRoutes.js
│   │   ├── utils/
│   │   │   └── email.js            Nodemailer with console fallback
│   │   ├── app.js                  Express app, middleware, route mounting
│   │   └── server.js               HTTP server, Socket.io, startup
│   ├── tests/
│   │   └── health.test.js
│   ├── Dockerfile
│   └── jest.config.js
│
├── docs/
│   └── architecture.md
├── .github/workflows/ci.yml
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting started

### Prerequisites

| Requirement | Version | Notes |
| --- | --- | --- |
| Node.js | 18 or later | Vite 7 requires a current LTS |
| npm | 9 or later | Ships with Node |
| MongoDB | 6 or later | Local install, or a free MongoDB Atlas cluster |
| Git | Any recent | |

### 1. Clone

```bash
git clone https://github.com/udeshrashmika/collabboard-fullstack.git
cd collabboard-fullstack
```

### 2. Server

```bash
cd server
npm install
```

Create `server/.env` — see [Environment variables](#environment-variables) below.

```bash
npm run dev
```

You should see:

```text
MongoDB success!
CollabBoard server running on port 5000
```

Confirm with `http://localhost:5000/api/health`.

### 3. Client

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`, click **Create an account**, and register.

### 4. Production build

```bash
cd client
npm run build      # writes to dist/
npm run preview    # serves dist/ for checking
```

---

## Environment variables

Create `server/.env`. This file is gitignored and must never be committed.

.env
MONGO_URI=mongodb://localhost:27017/collabboard
PORT=5000
JWT_SECRET=97cee0998c8a4ad1fe37ca417c9ea75b29fe819b408475415a1218dc5c41a06ea69df6737776b934669bf9a9cfc85a01
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
# MAIL_USER=ecoking825@gmail.com
# MAIL_PASS=your_real_16_char_app_password
MAIL_FROM=CollabBoard <ecoking825@gmail.com>

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**Notes**

- `JWT_SECRET` must be identical across every developer sharing a database. Tokens signed with one secret will not verify against another.
- If `MAIL_USER` and `MAIL_PASS` are blank, password reset links print to the server console instead of being emailed. The reset flow still works.
- Gmail requires an **App Password**, not your account password. Two-step verification must be enabled first.

The client reads `VITE_API_URL` and falls back to `http://localhost:5000/api`.

---

## Running with Docker

```bash
docker compose up --build
```

This starts three containers:

| Service | Port | Image |
| --- | --- | --- |
| mongo | 27017 | mongo:7 |
| server | 5000 | built from `server/Dockerfile` |
| client | 5173 | built from `client/Dockerfile` |

Set `JWT_SECRET` in your shell or a root `.env` before running, otherwise the compose file falls back to a development placeholder.

---

## API reference

Base URL: `http://localhost:5000/api`

### Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | No | Returns service status |

### Authentication

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | No | Create an account, returns user and token |
| POST | `/auth/login` | No | Sign in, returns user and token |
| GET | `/auth/me` | Bearer | Return the signed-in user |
| POST | `/auth/forgot-password` | No | Issue a reset token and email the link |
| POST | `/auth/reset-password` | No | Set a new password using a reset token |

<details>
<summary>Request and response examples</summary>

**POST /auth/register**

```json
{
  "name": "Rehan Perera",
  "email": "rehan@example.com",
  "password": "password123"
}
```

`201 Created`

```json
{
  "user": {
    "name": "Rehan Perera",
    "email": "rehan@example.com",
    "createdAt": "2026-08-27T15:37:07.248Z",
    "updatedAt": "2026-08-27T15:37:07.248Z",
    "id": "6a9059a389bd2c4f42146701"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

The password is never returned. `409` is returned if the email is already registered.

**POST /auth/login**

```json
{ "email": "rehan@example.com", "password": "password123" }
```

`401` with `"Incorrect email or password"` for both a wrong password and an unknown email, so the endpoint cannot be used to discover which addresses are registered.

**POST /auth/forgot-password**

```json
{ "email": "rehan@example.com" }
```

Always returns `200` with the same message regardless of whether the account exists.

**POST /auth/reset-password**

```json
{
  "email": "rehan@example.com",
  "token": "4d12e1428c1bfb5a...",
  "password": "newpassword456"
}
```

Reset tokens are single-use and expire after 30 minutes.

</details>

### Boards

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/boards` | None | List all boards |
| POST | `/boards` | None | Create a board |

### Columns

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/columns` | None | List all columns |
| POST | `/columns` | None | Create a column |

### Tasks

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/tasks` | None | List tasks. Filter with `?columnId=` or `?assignee=` |
| POST | `/tasks` | None | Create a task |
| GET | `/tasks/:taskId` | None | Fetch one task |
| PATCH | `/tasks/:taskId` | None | Update title, description or assignee |
| PATCH | `/tasks/:taskId/move` | None | Move a task to another column |
| DELETE | `/tasks/:taskId` | None | Delete a task |

The task endpoints validate ObjectIds, confirm the column and assignee exist, populate references on the way out, and reject a move to a column belonging to a different board.

> Board, column and task routes are currently **unauthenticated**. See [Known issues](#known-issues).

---

## Data models

### User

| Field | Type | Notes |
| --- | --- | --- |
| name | String | Required |
| email | String | Required, unique, lowercase, format-validated |
| password | String | Required, min 8 chars, bcrypt-hashed, `select: false` |
| resetTokenHash | String | SHA-256 of the reset token, `select: false` |
| resetTokenExpires | Date | 30 minutes after issue |
| createdAt / updatedAt | Date | Timestamps |

A pre-save hook hashes the password whenever it changes. A `toJSON` transform renames `_id` to `id` and strips `password`, `resetTokenHash` and `resetTokenExpires`.

### Board

| Field | Type | Notes |
| --- | --- | --- |
| title | String | Required |
| owner | ObjectId → User | Not currently set on create |
| createdAt / updatedAt | Date | Timestamps |

### Column

| Field | Type | Notes |
| --- | --- | --- |
| title | String | Required |
| boardId | ObjectId → Board | Required |
| createdAt / updatedAt | Date | Timestamps |

### Task

| Field | Type | Notes |
| --- | --- | --- |
| title | String | Required |
| description | String | Optional |
| columnId | ObjectId → Column | Required |
| assignee | ObjectId → User | Optional |
| createdAt / updatedAt | Date | Timestamps |

`optimisticConcurrency` is enabled on the Task schema, so Mongoose increments and checks a version key on save. This is the foundation for the concurrent-edit handling the project requires, though the API does not yet surface a `409` to clients.

### Relationships

```text
User ──1:N──> Board ──1:N──> Column ──1:N──> Task
                                              │
User <────────── assignee ─────────────────────┘
```

---

## Authentication

A single JWT access token. There is no refresh token.

1. Register or login returns a signed JWT containing the user id as `sub`.
2. The client stores it in `localStorage` under `collabboard_token`.
3. An Axios request interceptor attaches it to every call:
   `Authorization: Bearer <token>`
4. `requireAuth` verifies the signature against `JWT_SECRET`, loads the user, and attaches them to `req.user`.
5. A response interceptor clears the stored token on any `401`.
6. On page load, `AuthContext` calls `GET /auth/me` to confirm the stored token is still valid.

Tokens expire after `JWT_EXPIRES_IN` (7 days by default) and **cannot be revoked before expiry**. Logging out clears the token from that browser only.

### Password reset

1. The user submits their email.
2. The server generates 32 random bytes, stores only the SHA-256 hash, and sets a 30-minute expiry.
3. The raw token goes into a link sent by email — or printed to the console when mail is not configured.
4. The reset endpoint hashes the supplied token and matches it against the stored hash and expiry.
5. On success the password is replaced and the token is cleared, so the link cannot be reused.

Storing only the hash means a leaked database dump contains no usable reset tokens.

---

## Frontend architecture

Three layers, deliberately separated.

**Presentation** — components render markup and hold only local interaction state.

**State** — four React contexts own shared state and expose it through custom hooks:

| Context | Hook | Owns |
| --- | --- | --- |
| AuthContext | `useAuth()` | Signed-in user, token, auth calls |
| BoardsContext | `useBoards()` | Board list and mutations |
| TasksContext | `useTasks()` | Tasks, scoped by board |
| HistoryContext | `useHistory()` | Five most recently opened boards |

**Storage** — each provider reads and writes through a single pair of load/persist functions. Swapping browser storage for HTTP calls is confined to those functions, which is why the auth migration touched no presentation components.

### Routes

| Path | Access | Component |
| --- | --- | --- |
| `/` | Public | Login |
| `/register` | Public | Register |
| `/forgot-password` | Public | ForgotPassword |
| `/reset-password` | Public | ResetPassword |
| `/board` | Protected | Dashboard |
| `/board/:boardId` | Protected | KanbanBoard |

Protected routes nest inside `AppLayout` behind `ProtectedRoute`, so the sidebar and top bar render once and the matched child fills the content area through an `Outlet`.

### Client-side persistence

| Key | Owner | Contents |
| --- | --- | --- |
| `collabboard_token` | AuthContext | JWT access token |
| `collabboard_user` | AuthContext | Cached user object |
| `collabboard_boards` | BoardsContext | Board list |
| `collabboard_tasks` | TasksContext | All tasks |
| `collabboard_history` | HistoryContext | Recently opened board ids |
| `collabboard_task_draft` | TaskModal | An unsaved task in progress |

Every loader parses stored JSON inside a `try`/`catch` and checks the result is an array before returning it. Loaders run during state initialisation, outside any error boundary, so a single malformed entry would otherwise blank the page with no route to recovery.

The task modal saves what the user has typed on every keystroke, so a half-written task survives the browser closing.

---

## Testing

```bash
# server
cd server && npm test

# client
cd client && npm test
```

Currently there is **one** server test (`GET /api/health`) and **no** client tests. The tooling for both is installed and configured.

Planned coverage:

**Server (Jest + Supertest)**

- `POST /auth/register` creates a user and rejects a duplicate email with `409`
- `POST /auth/login` returns a token for valid credentials and `401` otherwise
- `GET /auth/me` returns `401` without a valid bearer token
- `PATCH /tasks/:id/move` rejects a move to a column on another board

**Client (Vitest + React Testing Library)**

- `ProtectedRoute` redirects an unauthenticated visitor away from `/board`
- The task modal rejects an empty title
- A malformed localStorage value does not crash a context provider

---

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request:

| Job | Steps |
| --- | --- |
| client | Install dependencies, run `npm run build` |
| server | Install dependencies, run `npm test` |

The build step catches unresolved imports that only surface at build time — a failure mode that has cost this project time before.

---

## Branch strategy

| Branch | Purpose |
| --- | --- |
| `main` | Stable, demonstrable snapshots |
| `develop` | Integration branch where feature work is combined |
| `feature/*` | One branch per feature or area |
| `test/*` | Test suites |
| `docs/*` | Documentation |
| `chore/*` | Configuration and DevOps |

Feature branches merge into `develop` by pull request. History is not squashed or rewritten, so individual contribution stays visible.

Branches used so far: `feature/auth-api`, `feature/auth-ui`, `feature/board-api`, `feature/board-ui`, `feature/task-api`, `feature/task-ui`, `feature/task-frontend-integration`, `feature/m07-database-models`, `feature/m08-database-integration`.

---

## Team

Ten members across four groups.

| Group | Members |
| --- | --- |
| Frontend | Rehan, Hashintha, Isuruni |
| Backend | Udesh, Omira, Deshini |
| Database | Yasiru, Uditha |
| Testing & deployment | Irosh, Kalana |

Contribution is visible in the git history:

```bash
git shortlog -sn --all
```

---

## Known issues

These are real gaps in the current build, listed so they can be planned rather than discovered.

### 1. Client calls routes the server does not have

`client/src/api/board.js` calls `PUT /boards/:id` and `DELETE /boards/:id`. `client/src/api/column.js` calls `GET /columns/board/:boardId`, `PUT /columns/:id` and `DELETE /columns/:id`.

None of these routes exist. `boardRoutes.js` and `columnRoutes.js` define only `GET /` and `POST /`, so every one of those calls returns `404 API route not found`.

### 2. The Board model drops most of what the client sends

`createBoard` in `client/src/api/board.js` sends `title`, `description`, `color`, `dueDate` and `members`. The Board schema defines only `title` and `owner`. Mongoose runs in strict mode by default, so the other four fields are silently discarded — no error, no data.

### 3. Board, column and task routes have no authentication

`getBoards` runs `Board.find()` with no filter, so any caller receives every board belonging to every user. `owner` is never set when a board is created, so there is nothing to filter by even if the middleware were added.

Fix: apply `requireAuth` to the three routers, set `owner: req.userId` on create, and filter reads by owner.

### 4. The dashboard still uses localStorage

`BoardsContext.jsx` reads and writes `collabboard_boards` in the browser. The API module at `client/src/api/board.js` exists but is not wired into the context, so boards do not reach MongoDB and are not shared between users.

### 5. Duplicate database configuration

`server/config/db.js` (used, default export, reads `process.env.MONGO_URI`) and `server/src/config/db.js` (unused, named export, takes a URI argument). The second should be deleted.

### 6. Models live outside `src/`

Schemas are in `server/models/`, while `server/src/models/` contains only a `.gitkeep`. Controllers reach up two levels with `../../models/`. Worth consolidating, but not mid-sprint — the import paths are stable and a move would conflict with in-flight branches.

### 7. Socket.io is connected but silent

`server.js` creates the Socket.io server and handles `join:board`, but no controller emits anything, and no client component subscribes. Real-time updates are scaffolded, not implemented.

### 8. `.env.example` is incomplete

It lists `PORT`, `MONGO_URI`, `JWT_SECRET` and `CLIENT_URL` but omits `JWT_EXPIRES_IN` and all five `MAIL_*` keys, so a new developer cannot tell what else to configure.

### 9. Tokens cannot be revoked

Access tokens are valid for their full lifetime with no denylist and no refresh rotation. Logout clears the token from one browser; it remains valid anywhere else it was copied.

---

## Roadmap

| Priority | Work |
| --- | --- |
| 1 | Add `PUT` and `DELETE` board routes, and the missing column routes |
| 2 | Extend the Board schema with description, color, dueDate, members and status |
| 3 | Apply `requireAuth` to board, column and task routes; scope reads by owner |
| 4 | Wire `BoardsContext` and `TasksContext` to the API, keeping localStorage as an offline cache |
| 5 | Surface `409 Conflict` on stale writes using the existing optimistic concurrency |
| 6 | Write the six planned tests and get them green in CI |
| 7 | Emit Socket.io events on board and task mutations; subscribe on the client |
| 8 | Verify `docker compose up` end to end and deploy to a public URL |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

In short: branch from `develop`, keep commit messages in the conventional format (`feat(scope): summary`), make sure `npm run build` passes before opening a pull request, and never commit `.env`.
