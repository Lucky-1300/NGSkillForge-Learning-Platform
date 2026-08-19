# NGSkillForge Learning Platform API

The backend is an Express/Mongoose REST API for the NGSkillForge learning platform. It provides OTP-backed registration, JWT authentication, role-protected administration, courses, assignments, and enrollments.

## Stack

- Node.js and Express 5
- MongoDB with Mongoose
- JWT and bcryptjs
- Nodemailer for OTP email
- Multer and Cloudinary for assignment files
- Morgan, CORS, and express-rate-limit

## Setup

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

`npm start` runs the production-style Node process. The API listens on `PORT` (default `5000`). The server requires a reachable MongoDB instance before protected data operations can work.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port, default `5000` |
| `NODE_ENV` | `development` or `production`; production hides internal error details |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used for access and refresh JWTs |
| `FRONTEND_URLS` | Comma-separated allowed browser origins, default `http://localhost:5173` |
| `PRIMARY_ADMIN_EMAIL` | Email that receives the configured primary admin role |
| `AUTH_RATE_WINDOW_MS` | Authentication rate-limit window, default 15 minutes |
| `AUTH_RATE_LIMIT` | Authentication requests per window, default 100 |
| `EMAIL_USER` / `EMAIL_PASS` | SMTP/Gmail credentials used for OTP delivery |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

Never commit `.env` or real credentials. `.env.example` contains placeholders only.

## Structure

```text
backend/
  app.js
  config/          database and mail configuration
  controllers/     request handlers
  middleware/      auth, roles, validation, uploads, logging, errors
  models/          User, Otp, Course, Assignment, Enrollment
  routes/          feature route modules
  uploads/         temporary assignment upload directory
  postman/         collection and local environment
```

## Authentication flow

1. `POST /api/auth/send-otp` with `{ "email": "person@example.com" }`.
2. `POST /api/auth/verify-otp` with the email and six-digit OTP.
3. `POST /api/auth/register` with `name`, `email`, and `password`. Registration requires a verified OTP. The server assigns the normal `user` role; the configured primary admin email receives `admin`.
4. `POST /api/auth/login` returns `accessToken`, `refreshToken`, and a public user object.
5. Send the access token as `Authorization: Bearer <token>` to protected routes.
6. `POST /api/auth/refresh-token` with `{ "token": "<refreshToken>" }` returns a new access token.
7. `POST /api/auth/logout` returns a confirmation. JWTs are otherwise stateless, so clients should discard both tokens.

Authentication and OTP endpoints are rate limited. Password hashes, OTP values, and tokens are never returned by the API.

## API endpoints

### Health

`GET /api/health` is public and returns the API and current MongoDB connection state.

### Auth

| Method | Path | Auth |
| --- | --- | --- |
| `POST` | `/api/auth/send-otp` | Public |
| `POST` | `/api/auth/verify-otp` | Public |
| `POST` | `/api/auth/register` | Public, verified OTP required |
| `POST` | `/api/auth/login` | Public |
| `POST` | `/api/auth/refresh-token` | Public with refresh token |
| `POST` | `/api/auth/logout` | Public |

### Users

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/users/profile` | User |
| `GET` | `/api/users/all-users` | Admin |
| `DELETE` | `/api/users/delete-user/:id` | Admin |

### Courses

| Method | Path | Auth |
| --- | --- | --- |
| `POST` | `/api/courses/create-course` | Admin |
| `GET` | `/api/courses/all-courses` | Public |
| `GET` | `/api/courses/single-course/:id` | Public |
| `PUT` | `/api/courses/update-course/:id` | Admin |
| `DELETE` | `/api/courses/delete-course/:id` | Admin |

Course listing supports `page`, `limit` (maximum 100), `search`, `category`, and `level` (`Beginner`, `Intermediate`, or `Advanced`). Example:

```text
GET /api/courses/all-courses?page=1&limit=10&search=node&category=Backend&level=Beginner
```

The existing response keys remain compatible: `courses`, `totalCourses`, `currentPage`, and `totalPages`.

### Assignments

| Method | Path | Auth |
| --- | --- | --- |
| `POST` | `/api/assignments/upload-assignment` | Admin, multipart form |
| `GET` | `/api/assignments/all-assignments` | User |
| `GET` | `/api/assignments/single-assignment/:id` | User |
| `DELETE` | `/api/assignments/delete-assignment/:id` | Admin |

Upload fields are `title`, `description`, `course`, and `file`. Accepted MIME types are JPEG, PNG, MP4, and PDF. Files are limited to 5 MB and are uploaded to Cloudinary; temporary local files are removed after processing.

### Enrollments

| Method | Path | Auth |
| --- | --- | --- |
| `POST` | `/api/enrollments/enroll-course` | User |
| `GET` | `/api/enrollments/my-enrollments` | User |

Enroll with `{ "courseId": "<course ObjectId>" }`. Duplicate enrollment is rejected.

## Responses and errors

Existing successful response shapes are preserved for compatibility. Responses include `success: true` and a message where the original API provided one. Errors use:

```json
{ "success": false, "message": "A clear error message" }
```

Validation failures and invalid IDs return `400`; missing/invalid authentication returns `401`; insufficient roles return `403`; missing records return `404`; conflicts return `409`; unexpected production errors return a generic `500` response. Detailed server errors are logged server-side only.

## Postman

Import `postman/NGSkillForge.postman_collection.json` and select `postman/NGSkillForge.local.postman_environment.json`. The collection includes the health check and the existing authentication, course, user, enrollment, and assignment requests.
