# Notsify

Notsify is a full-stack MERN notes application with JWT authentication (access + rotating
refresh tokens in httpOnly cookies), role-based access (user / admin), and
Cloudinary-backed image uploads.

## Stack

- **Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT, Cloudinary
- **Frontend:** React 19, Vite, Tailwind CSS, React Router 7, Axios

## Project structure

```
backend/    Express API (auth, notes, admin)
frontend/   Vite + React client
docker-compose.yml   Mongo + backend + frontend
```

## Prerequisites

- Node.js 22+
- A MongoDB instance (local or Atlas)
- A Cloudinary account

## Local setup

### 1. Backend

```bash
cd backend
cp .env.example .env      # then fill in the values
npm install
npm run dev               # starts on http://localhost:3000
```

Required environment variables are documented in `backend/.env.example`.
The server validates them at startup and exits if any are missing.

Generate strong JWT secrets:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env      # optional; defaults to http://localhost:3000
npm install
npm run dev               # starts on http://localhost:5173
```

## Running with Docker

Create a `.env` in the project root (used by docker-compose) with your JWT and
Cloudinary values, then:

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- MongoDB: localhost:27017

## Creating an admin user

Roles are never assigned from the signup form — every account is created as
`user`. To promote a user to admin, update the document directly in MongoDB:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } });
```

Admins can access the Admin dashboard (`/admin`) to view all users and notes.

## API overview

| Method | Route            | Auth        | Description                     |
| ------ | ---------------- | ----------- | ------------------------------- |
| POST   | `/auth/signup`   | public      | Create an account               |
| POST   | `/auth/login`    | public      | Log in, sets cookies            |
| POST   | `/auth/refresh`  | cookie      | Rotate tokens                   |
| POST   | `/auth/logout`   | cookie      | Log out, clears cookies         |
| GET    | `/notes`         | user        | List own notes (admin: all)     |
| GET    | `/notes/:id`     | user        | Get a single note               |
| POST   | `/notes`         | user        | Create a note (multipart)       |
| PUT    | `/notes/:id`     | user        | Update a note (multipart)       |
| DELETE | `/notes/:id`    | user        | Delete a note                   |
| GET    | `/admin/users`   | admin       | List all users                  |
| GET    | `/admin/notes`   | admin       | List all notes with authors     |

## Scripts

Backend:

- `npm run dev` — start with nodemon
- `npm start` — start
- `npm test` — run the Node test runner
- `npm run lint` — ESLint

Frontend:

- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the build
- `npm run lint` — ESLint
