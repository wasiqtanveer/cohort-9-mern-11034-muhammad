# Notely

A note-taking web app built for the 10Pearls Cohort 9 MERN assignment by Muhammad Wasiq Tanveer.

Users register, log in, and keep a personal set of rich-text notes. Notes can be pinned, searched, sorted, duplicated, and recovered from a trash that empties itself after 7 days.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19, Vite, React Router 7, Tailwind CSS v4 |
| Editor | Quill 2 via `react-quill-new` |
| Backend | Node, Express 5 |
| Database | PostgreSQL (`pg`, no ORM) |
| Auth | JWT, `bcrypt` password hashing |
| Backend tests | Mocha + Chai + Supertest |
| Frontend tests | Jest + React Testing Library |

Postgres rather than Mongo, and plain SQL rather than an ORM, so the schema and every query are explicit.

---

## Features

**Accounts**
- Register, log in, log out
- Passwords hashed with bcrypt, never stored or returned in plain text
- JWT kept in `localStorage` and attached by an axios request interceptor
- Sessions survive a refresh — a saved token is revalidated against `/auth/me` on load
- Show/hide password toggle

**Notes**
- Rich text editing — headings, bold, italic, underline, strikethrough, lists, blockquote, inline code, links
- Every note is scoped to its owner; one user can never read or modify another's
- Content is sanitized twice: DOMPurify before render, `sanitize-html` before it reaches the database
- Pin a note to keep it at the top of any sort
- Duplicate a note
- `Ctrl`/`Cmd` + `S` saves from inside the editor
- Warns before discarding unsaved changes

**Finding notes**
- Live search, filterable by title only, text only, or both
- Search reads the rendered text, not the HTML, so a search for `p` does not match every `<p>` tag
- Sort by recently updated, recently created, or title A–Z / Z–A
- Pinned notes stay on top regardless of the sort

**Trash**
- Deleting moves a note to the trash instead of destroying it
- Restore it, or delete it permanently (both confirm first)
- Anything sitting in the trash for more than 7 days is purged automatically
- Trashed notes cannot be edited or pinned

---

## Prerequisites

- Node 18 or newer
- PostgreSQL running locally

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd cohort-9-mern-11034-muhammad

cd backend && npm install
cd ../frontend && npm install
```

### 2. Create the two databases

The app uses a separate database for tests, because the test suite truncates tables between runs and would wipe your real data otherwise.

```sql
CREATE DATABASE notes_app;
CREATE DATABASE notes_app_test;
```

### 3. Configure the backend

Copy `backend/.env.example` to `backend/.env` and fill it in:

```env
PORT=5000
NODE_ENV=development

DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=notes_app
DB_NAME_TEST=notes_app_test

JWT_SECRET=some_long_random_string
JWT_EXPIRES_IN=7d
```

`JWT_SECRET` is validated at startup — the server refuses to boot without it.

### 4. Create the tables

Run the schema against **both** databases:

```bash
psql -U postgres -d notes_app      -f backend/db/schema.sql
psql -U postgres -d notes_app_test -f backend/db/schema.sql
```

`schema.sql` is safe to re-run. The `CREATE TABLE` statements are `IF NOT EXISTS`, and the `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` lines below them migrate a database that was created before those columns existed.

---

## Running

Two terminals:

```bash
# terminal 1
cd backend
npm run dev          # http://localhost:5000

# terminal 2
cd frontend
npm run dev          # http://localhost:5173
```

The frontend expects the API at `http://localhost:5000/api` (set in `frontend/src/api/client.js`).

---

## Tests

```bash
cd backend  && npm test     # 50 tests, Mocha + Chai + Supertest
cd frontend && npm test     # 27 tests, Jest + React Testing Library
```

The backend suite hits a real Postgres database — `notes_app_test` must exist and have the schema applied. It truncates tables before each test, so never point `DB_NAME_TEST` at your development database.

---

## API

All `/api/notes` routes require an `Authorization: Bearer <token>` header and only ever act on notes belonging to the token's owner. A note owned by someone else returns `404`, not `403`, so the response never confirms that the note exists.

### Auth

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Log in, returns a JWT |
| `GET`  | `/api/auth/me` | Current user, used to restore a session |

### Notes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/notes` | List live notes, pinned first |
| `GET` | `/api/notes/:id` | One note |
| `POST` | `/api/notes` | Create |
| `PUT` | `/api/notes/:id` | Update title and content |
| `PATCH` | `/api/notes/:id/pin` | Pin or unpin — body `{ "is_pinned": true }` |
| `DELETE` | `/api/notes/:id` | Move to trash |

### Trash

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/notes/trash` | List trashed notes, purging anything older than 7 days |
| `PATCH` | `/api/notes/:id/restore` | Put a note back |
| `DELETE` | `/api/notes/:id/permanent` | Delete for good |

`GET /api/notes/trash` is registered before `GET /api/notes/:id`. Express matches routes in order, so the reverse would bind `id = "trash"` and fail id validation.

---

## Schema

```
users
  id             SERIAL PRIMARY KEY
  name           VARCHAR(100)   NOT NULL
  email          VARCHAR(255)   NOT NULL UNIQUE
  password_hash  TEXT           NOT NULL
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()

notes
  id          SERIAL PRIMARY KEY
  user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE
  title       VARCHAR(200) NOT NULL
  content     TEXT         NOT NULL DEFAULT ''
  is_pinned   BOOLEAN      NOT NULL DEFAULT FALSE
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  deleted_at  TIMESTAMPTZ  NULL      -- NULL = live, timestamp = in the trash
```

Deleting a user cascades to their notes. `deleted_at` drives the trash: every list query filters on it, and it is indexed.

---

## Project structure

```
backend/
  config/db.js            postgres connection pool
  controllers/            auth and notes request handlers
  middleware/             JWT protect, error handler
  routes/                 express routers
  db/schema.sql           tables, indexes, migrations
  test/                   mocha suites

frontend/src/
  api/client.js           axios instance and token interceptor
  components/             AppShell, AuthLayout, ConfirmDialog, Doodles,
                          PasswordInput, ProtectedRoute, SubmitButton, TextField
  context/                auth context and provider
  pages/                  Login, Signup, Dashboard, NoteEditor, Trash, Profile
  theme/sessionTheme.js   picks the per-session page colours
```

---

## Notes on a few decisions

**Pinning sends an explicit value, not a toggle.** `PATCH /pin` takes `{ is_pinned: true|false }` rather than flipping whatever is stored. A toggle can desync from the UI if two clicks land close together.

**Pinning does not touch `updated_at`.** Pinning is not an edit, so it must not jump a note to the top of the "recently updated" sort. There is a test for this.

**The trash purges on read.** `GET /api/notes/trash` deletes anything past 7 days before selecting. That keeps the retention rule in the same code path that displays the trash, with no scheduler and no extra dependency.

**Search and sort are client side.** The dashboard already holds every note for the user, so filtering in the browser is instant and needs no extra API surface.

**Two databases.** The test suite truncates tables between tests. Sharing one database with development would delete real notes on every test run.
