# Campus Club Backend (Monolith)

Backend implementation for a single-club Campus Club Management System using a monolithic Node.js + Express architecture.

## Architecture

This repository now runs as a single deployable backend process:

- `src/app.js`: monolith HTTP app
- `src/server.js`: monolith bootstrap (DB + default admin seed + server startup)
- `src/models/*`: mongoose models
- `src/controllers/*`: request handlers
- `src/services/*`: business logic
- `src/routes/*`: route definitions
- `src/validators/*`: request validators
- `src/middlewares/*`, `src/utils/*`: shared runtime utilities

### Request Flow

All client traffic goes directly to one app:

`/api/v1/*` -> monolith router -> feature modules -> MongoDB

There is no runtime API gateway proxy hop and no service-to-service network deployment requirement.

## Folder Structure

```text
campus-club-backend/
  src/
    app.js
    server.js
    constants/
    controllers/
    db/
    middlewares/
    models/
    routes/
    services/
    utils/
    validation/
    validators/
  docker-compose.yml
  docker-compose.prod.yml
  .env.example
```

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- `bcryptjs`
- `multer` (image upload handling)
- Cloudinary (optional)
- REST APIs

## Core Business Rules Implemented

- Registration creates `pending` users
- Email verification is tracked separately (`emailVerified`)
- `emailVerified` does not auto-approve accounts
- Pending/rejected users cannot log in as active members
- Admin can approve/reject users
- Only approved users can access member functionality
- Event RSVP:
  - one RSVP per user per event (unique compound index)
  - auto-deny when full
  - event automatically closes when capacity reached
- Admin-only controls:
  - user approval/rejection and member listing
  - event CRUD
  - attendees per event
  - announcement CRUD
  - gallery CRUD

## Development Run (Docker)

1. Create development env file:

```bash
cp .env.example .env.development
```

2. Start development stack:

```bash
docker compose up --build
```

Base URL:

```text
http://localhost:4000/api/v1
```

The development compose includes:

- `mongo` (MongoDB)
- `mailhog` (SMTP capture + web UI)
- `backend` (single monolith API container)

MailHog details:

- SMTP host inside Docker network: `mailhog`
- SMTP port: `1025`
- Web inbox UI: `http://localhost:8025`

## Local Run (without Docker)

```bash
npm install
npm run dev
```

Production-style local run:

```bash
npm run start
```

## Production (Optional)

```bash
docker compose -f docker-compose.prod.yml up --build
```

## Environment Variables

Required:

- `MONGO_URI`
- `JWT_SECRET`

Recommended:

- `MONGO_DB_NAME`
- `SERVICE_AUTH_KEY`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_ADMIN_NAME`
- `API_PUBLIC_BASE_URL`
- `FRONTEND_VERIFY_EMAIL_URL`
- `EMAIL_VERIFICATION_TOKEN_TTL_MINUTES`
- `FRONTEND_RESET_PASSWORD_URL`
- `PASSWORD_RESET_TOKEN_TTL_MINUTES`

Optional:

- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` for file uploads
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` for verification/password-reset email delivery
- `LOG_DIR` (default `./logs`)
- `ENABLE_FILE_LOGS` (default `true`)

## API Routes

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/verify-email/request`
- `POST /auth/verify-email/confirm`
- `GET /auth/verify-email/confirm?token=...`
- `GET /users/me`
- `PUT /users/me`
- `PUT /users/me/password`
- `PUT /users/me/profile-image`
- `GET /admin/users`
- `PATCH /admin/users/:id/approve`
- `PATCH /admin/users/:id/reject`
- `POST /admin/users/import-csv` (multipart form-data file field: `file`)

### Events

- `POST /events`
- `GET /events`
- `GET /events/:id`
- `PUT /events/:id`
- `DELETE /events/:id`

### RSVP

- `POST /rsvps`
- `DELETE /rsvps/:eventId`
- `GET /rsvps/me`
- `GET /events/:eventId/attendees`

### Announcements

- `POST /announcements`
- `GET /announcements`
- `PUT /announcements/:id`
- `DELETE /announcements/:id`

### Gallery

- `POST /gallery`
- `GET /gallery`
- `PUT /gallery/:id`
- `DELETE /gallery/:id`

## Postman

Import:

- `docs/postman/Campus-Club-Backend-SOA.postman_collection.json`

Sample CSV:

- `docs/postman/sample-members-import.csv`

Default scripts and Docker flows target the monolith runtime in `src/server.js`.

## License and Attribution

- Copyright (C) 2026 Ahmed Elgalaly
- Licensed under GNU General Public License v3.0 only (`GPL-3.0-only`)
- Repository owner and primary author: Ahmed Elgalaly (`https://github.com/ahmedelgalaly`)
