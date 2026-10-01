# 🚀 NGSkillForge Learning Platform

> **Full-Stack MERN Developer Education Platform with Embedded YouTube Lectures, Comprehensive Course Notes Library, Interactive MCQs & Practice Tasks, Groq AI Tutoring, Final Course Assessments, and Verifiable PDF Certification.**

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Complete Technology Stack](#2-complete-technology-stack)
3. [Project Folder Structure](#3-project-folder-structure)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Database Configuration & Schemas](#6-database-configuration--schemas)
7. [Authentication Flow & Security](#7-authentication-flow--security)
8. [Course System](#8-course-system)
9. [YouTube Lecture Integration](#9-youtube-lecture-integration)
10. [Course Notes System](#10-course-notes-system)
11. [Practice Tasks System](#11-practice-tasks-system)
12. [MCQ & Quiz System](#12-mcq--quiz-system)
13. [Groq AI Integration & AI Studio](#13-groq-ai-integration--ai-studio)
14. [Cloudinary File Upload Integration](#14-cloudinary-file-upload-integration)
15. [Complete API Documentation](#15-complete-api-documentation)
16. [Complete User Journey](#16-complete-user-journey)
17. [Complete Data Flow Diagrams](#17-complete-data-flow-diagrams)
18. [Environment Variables](#18-environment-variables)
19. [Installation & Setup](#19-installation--setup)
20. [Running the Project](#20-running-the-project)
21. [Deployment Guide](#21-deployment-guide)
22. [Important Files for Evaluation](#22-important-files-for-evaluation)
23. [Evaluation & Viva Preparation Q&A](#23-evaluation--viva-preparation-qa)
24. ["Explain My Project in 2 Minutes" (Spoken Pitch)](#24-explain-my-project-in-2-minutes)
25. ["Explain My Project in 5 Minutes" (Detailed Presentation)](#25-explain-my-project-in-5-minutes)
26. ["How Everything Is Connected" (Master Architecture Diagram)](#26-how-everything-is-connected)
27. [Common Evaluation Traps & Viva Defense](#27-common-evaluation-traps--viva-defense)
28. [Current vs Planned Features](#28-current-vs-planned-features)
29. [Quick Revision Sheet (One-Page Cheat Sheet)](#29-quick-revision-sheet)

---

# 1. Project Overview

### Project Name
**NGSkillForge Learning Platform**

### Purpose
**NGSkillForge** is a production-ready, full-stack online learning management system (LMS) built for engineering and computer science students. It bridges the gap between passive video watching and real hands-on mastery by combining **curated YouTube video lectures**, **in-app structured course notes**, **modular practice coding tasks**, **interactive knowledge checks**, **server-graded final assessments**, and **cryptographically verifiable completion certificates**.

### Problem It Solves
1. **Scattered Learning Material:** Students typically watch YouTube tutorials in one tab, search for notes in another, practice code in a third tab, and have no way to verify their learning. NGSkillForge unifies the entire learning lifecycle inside a single web application.
2. **Heavy Server Bandwidth Costs:** Storing video files directly on custom backend servers requires enormous storage and bandwidth. NGSkillForge embeds public YouTube playlist video streams via clean, responsive iframes with zero video hosting overhead on the backend.
3. **No Credential Verification:** Most free tutorials do not offer certificates or verification. NGSkillForge implements automated prerequisite validation (100% lecture completion), timed final examinations, and server-generated PDF certificates verifiable via unique public IDs.
4. **Lack of Instant Assistance:** When students get stuck on a coding concept during a lecture, they lack contextual help. NGSkillForge integrates Groq AI (`qwen/qwen3.8-27b` / `llama-3.3-70b-versatile`) as an in-lecture AI Tutor that answers technical questions in real time.

### Main Features
- **Comprehensive Course Catalog:** Filter by category, difficulty level (Beginner, Intermediate, Advanced), pagination, and instant keyword search.
- **YouTube Lecture Cinema Player:** Embedded responsive video player with sequential previous/next navigation, pedagogical module grouping, and automated completion tracking.
- **Course Notes Library (12 HTML Topics):** Standalone in-course documentation reader with 1-click code copying, live search, syntax highlighting, callout alert cards, and mobile-friendly drawer navigation.
- **Hands-On Tasks & MCQs:** Practice tasks with starter code and solution toggles, plus interactive multiple-choice questions with instant scoring.
- **Final Course Assessments:** Timed final assessments with passing threshold (70%), anti-cheat prerequisite check (all lectures must be finished), and detailed question-by-question review.
- **Verifiable PDF Certificates:** Automated issuance of completion certificates with server-side PDF generation (`PDFKit`) and public verification URL (`/verify-certificate?id=...`).
- **Student Dashboard:** Real-time progress bars, "Continue Learning" quick jump shortcuts, recent activity timeline, and gamified achievement badges (`FIRST_LECTURE`, `TEN_LECTURES`, `FIRST_ASSESSMENT`, `FIRST_COURSE`).
- **Groq AI Tutor & Admin Studio:** In-lecture conversational AI tutor for learners, plus an Admin AI Content Generation pipeline to extract YouTube transcripts and automatically generate notes, tasks, and quizzes.
- **Dual-Token Authentication & Email OTP:** Secure registration verified by 6-digit email OTP (via Nodemailer), password hashing with `bcryptjs`, and dual JWT access (15m) + refresh token (7d) system.
- **Dark/Light Theme Engine:** Pure CSS design tokens with smooth transition animations and persistence in `localStorage`.

---

# 2. Complete Technology Stack

| Technology | Where It Is Used | Why It Is Used |
| :--- | :--- | :--- |
| **React 19** | `frontend/src/` | Component-based Single Page Application (SPA) architecture with fast reconciliation and virtual DOM rendering. |
| **Vite 8** | `frontend/vite.config.js` | Ultra-fast build tool and dev server featuring native ES Modules and instant Hot Module Replacement (HMR). |
| **React Router DOM v7** | `frontend/src/App.jsx` | Client-side routing, protected routes (`ProtectedRoute.jsx`), nested routes, and query parameter state synchronization. |
| **Axios 1.19** | `frontend/src/services/api.js` | Promise-based HTTP client configured with request interceptors (attaching Bearer JWT) and response interceptors (automatic token refresh). |
| **React Icons 5.7** | Throughout Frontend Components | Lightweight, scalable vector icons (`FiPlay`, `FiCheckCircle`, `FiBookOpen`, `FiAward`, `FiCpu`, etc.). |
| **React Toastify 11.1** | Throughout Frontend Components | Non-blocking, beautiful toast notifications for user actions (login, completion, errors, copy). |
| **Node.js** | `backend/` | Scalable JavaScript runtime environment executing asynchronous server-side code. |
| **Express.js 5.2** | `backend/app.js` | Fast, unopinionated backend web framework handling REST API routing, middleware, and request dispatching. |
| **MongoDB Atlas** | Cloud Database Cluster | Distributed NoSQL document database providing flexible JSON-like document storage and high availability. |
| **Mongoose 9.6** | `backend/models/` | Object Data Modeling (ODM) library for MongoDB providing schema validation, type casting, indexes, and queries. |
| **JSON Web Tokens (JWT)** | `backend/middleware/auth.middleware.js` | Stateless, cryptographic user authentication utilizing short-lived access tokens and secure refresh tokens. |
| **bcryptjs 3.0** | `backend/controllers/auth.controller.js` | Salted one-way password hashing (10 rounds) protecting credentials against rainbow-table attacks. |
| **Nodemailer 9.0** | `backend/config/mail.config.js` | SMTP email client delivering 6-digit one-time password (OTP) verification emails via Gmail SMTP. |
| **otp-generator 4.0** | `backend/controllers/auth.controller.js` | Cryptographically safe 6-digit numeric OTP generator for account registration verification. |
| **Multer 2.1** | `backend/middleware/upload.middleware.js` | Multipart/form-data middleware handling temporary server buffering for file uploads. |
| **Cloudinary SDK v2.10** | `backend/controllers/assignment.controller.js` | Cloud media storage managing assignment file uploads with secure CDN delivery. |
| **Groq SDK (groq-sdk 1.6)** | `backend/services/ai.service.js` | Ultra-low latency inference engine powering the AI Coding Tutor and AI Content Generation Studio (`qwen/qwen3.8-27b` / `llama-3.3-70b-versatile`). |
| **PDFKit 0.20** | `backend/services/certificate.service.js` | Server-side vector PDF document generator creating pixel-perfect, printable course completion certificates. |
| **youtube-transcript 1.3** | `backend/services/transcript.service.js` | Automated extractor fetching subtitle tracks and closed captions directly from YouTube video IDs. |
| **express-rate-limit 8.6** | `backend/app.js` | DoS protection and brute-force prevention rate limiter on authentication endpoints (`/api/auth/*`). |
| **Vanilla CSS (Design Tokens)** | `frontend/src/index.css`, `theme.css` | High-performance styling system using CSS custom properties (`var(--primary)`, `var(--bg-card)`) supporting Dark/Light mode without heavy external frameworks. |

---

# 3. Project Folder Structure

```text
NGSkillForge-Learning-Platform/
├── package.json                         # Workspace root configuration
├── .gitignore                           # Git ignore rules
│
├── backend/                             # Node.js + Express REST API Backend
│   ├── .env                             # Active environment variables (git-ignored)
│   ├── .env.example                     # Environment template with placeholder values
│   ├── app.js                           # Express application entry point & route mounting
│   ├── package.json                     # Backend dependencies and scripts
│   │
│   ├── config/                          # Infrastructure Configurations
│   │   ├── db.js                        # Mongoose MongoDB Atlas connection
│   │   └── mail.config.js               # Nodemailer SMTP transporter
│   │
│   ├── models/                          # Mongoose Database Models (14 Models)
│   │   ├── user.model.js                # User schema (name, email, password, role)
│   │   ├── otp.model.js                 # 6-digit OTP schema with TTL index
│   │   ├── course.model.js              # Course schema (modules, lessons, tasks, MCQs)
│   │   ├── lecture.model.js             # YouTube lecture metadata (video ID, duration)
│   │   ├── courseNote.model.js          # Course Notes schema (12 topic chapters, sections)
│   │   ├── lectureContent.model.js      # Rich lecture content (structured notes, tasks, MCQs)
│   │   ├── lectureTranscript.model.js   # YouTube closed captions & segment timings
│   │   ├── progress.model.js            # Student per-lecture completion tracking
│   │   ├── enrollment.model.js          # Course enrollment & overall progress
│   │   ├── assessment.model.js          # Course final assessment & questions
│   │   ├── assessmentAttempt.model.js   # Student assessment submission records & grades
│   │   ├── certificate.model.js         # Verified course completion certificates
│   │   ├── studentAchievement.model.js  # Gamified achievement badges
│   │   └── assignment.model.js          # Cloudinary assignment submissions
│   │
│   ├── middleware/                      # Express Middleware
│   │   ├── auth.middleware.js           # JWT verification (authMiddleware, optionalAuthMiddleware)
│   │   ├── role.middleware.js           # Role-based access control (Admin guard)
│   │   ├── validation.middleware.js     # Request payload & ObjectId validators
│   │   ├── upload.middleware.js         # Multer temporary file disk storage & filters
│   │   ├── error.middleware.js          # Centralized error handler returning JSON
│   │   └── logger.middleware.js         # HTTP request logging
│   │
│   ├── routes/                          # API Route Definitions (17 Route Files)
│   │   ├── auth.routes.js               # /api/auth (OTP, Register, Login, Refresh, Logout)
│   │   ├── user.routes.js               # /api/users (Profile, Admin user management)
│   │   ├── course.routes.js             # /api/courses (Catalog, Topics, Subtopics, CRUD)
│   │   ├── lecture.routes.js            # /api/lectures (Lectures list, Single lecture, Toggle)
│   │   ├── courseNote.routes.js         # /api/notes (Course notes, Topic notes)
│   │   ├── progress.routes.js           # /api/progress (Lecture completion, Access timestamps)
│   │   ├── assessment.routes.js         # /api/assessments (Student assessment taking & grading)
│   │   ├── adminAssessment.routes.js    # /api/admin/assessments (Admin assessment builder)
│   │   ├── certificate.routes.js        # /api/certificates (My certs, Download PDF, Public verify)
│   │   ├── dashboard.routes.js          # /api/student/dashboard (Student dashboard aggregation)
│   │   ├── analytics.routes.js          # /api/admin/analytics (Platform overview metrics)
│   │   ├── search.routes.js             # /api/search (Global multi-entity search)
│   │   ├── ai.routes.js                 # /api/ai (AI Tutor Q&A, AI Generator pipeline)
│   │   ├── adminContent.routes.js       # /api/admin/content (Admin AI review & publishing)
│   │   ├── assignment.routes.js         # /api/assignments (Cloudinary file uploads)
│   │   └── enrollment.routes.js         # /api/enrollments (Enroll course, My enrollments)
│   │
│   ├── controllers/                     # Request Handling Controllers (15 Controllers)
│   │   ├── auth.controller.js           # Handles OTP email, bcrypt hashing, JWT issuance
│   │   ├── course.controller.js         # Handles course pagination, search, topic resolution
│   │   ├── lecture.controller.js        # Handles YouTube video grouping, completion toggles
│   │   ├── courseNote.controller.js     # Serves structured 12-topic course study notes
│   │   ├── progress.controller.js       # Manages student lecture progress & continue learning
│   │   ├── assessment.controller.js     # Secure server-side grading & prerequisite checking
│   │   ├── certificate.controller.js    # Issues certificates & streams PDFKit documents
│   │   ├── dashboard.controller.js      # Aggregates student overview, continue shortcuts, activity
│   │   ├── analytics.controller.js      # Calculates admin platform analytics & KPIs
│   │   ├── search.controller.js         # Global search across courses, lectures, topics
│   │   ├── ai.controller.js             # Dispatches Groq AI completions & transcript handling
│   │   ├── adminContent.controller.js   # Admin draft management and publishing
│   │   ├── assignment.controller.js     # Cloudinary assignment file uploads and deletion
│   │   ├── enrollment.controller.js     # Enrolls students and updates progress
│   │   └── user.controller.js           # User profile and admin deletion
│   │
│   ├── services/                        # Business Logic Services
│   │   ├── ai.service.js                # Groq SDK initialization, retry logic & rate limiting
│   │   ├── aiTutor.service.js           # Context-aware student conversational tutor
│   │   ├── aiContent.service.js         # AI generation prompts for Notes, Tasks, MCQs
│   │   ├── youtube.service.js           # YouTube Data API v3 & Innertube scraper
│   │   ├── transcript.service.js        # YouTube subtitle extraction & caching
│   │   ├── certificate.service.js       # PDFKit canvas layout & cryptographic ID generation
│   │   ├── achievement.service.js       # Gamified badge evaluation engine
│   │   └── courseHelper.js              # Course slug resolution & module grouping logic
│   │
│   └── seed/                            # Database Seed Scripts & Datasets
│       ├── data/
│       │   ├── html_notes_data.json     # Complete 12-topic HTML Course Notes dataset (~217 KB)
│       │   ├── css_course_data.js       # CSS Course seed data
│       │   └── fullstack_course_data.js # Fullstack Course seed data
│       ├── seed_html_notes.js           # Seeds HTML5 CourseNote collection in MongoDB Atlas
│       └── seed_all_courses.js          # Master seed runner for all courses
│
└── frontend/                            # React 19 + Vite Single Page Application
    ├── index.html                       # HTML5 template entry point
    ├── vite.config.js                   # Vite configuration
    ├── package.json                     # Frontend dependencies and scripts
    │
    └── src/
        ├── main.jsx                     # React DOM root render & Context Providers
        ├── App.jsx                      # Client router setup & application shell
        ├── App.css                      # Global layout & utility styles
        ├── index.css                    # Design token definitions (colors, typography, radii)
        ├── theme.css                    # Dark/Light theme CSS variables
        │
        ├── context/                     # React Context State Providers
        │   ├── AuthContext.jsx          # Authentication state, login, register, logout, refresh
        │   ├── authContext.js           # AuthContext React definition
        │   ├── ThemeContext.jsx         # Theme state (light/dark), persistence, toggle
        │   └── themeContext.js          # ThemeContext React definition
        │
        ├── services/
        │   └── api.js                   # Configured Axios instance with JWT interceptors
        │
        ├── components/                  # Reusable UI Components
        │   ├── Navbar.jsx               # Header navigation, search trigger, theme switch, auth
        │   ├── Footer.jsx               # Footer links, brand info, legal navigation
        │   ├── ProtectedRoute.jsx       # Route guard for authenticated & admin users
        │   ├── CourseCard.jsx           # Catalog course card with level badge & progress
        │   ├── CourseFilters.jsx        # Category, level, and search filters
        │   ├── CourseNotesViewer.jsx    # 2-column Course Notes viewer with TOC and code copy
        │   ├── CourseNotesViewer.css    # Responsive styles for Course Notes reader
        │   ├── NotesRenderer.jsx        # Markdown and syntax-highlighted code renderer
        │   ├── LessonContentRenderer.jsx# Rich HTML content renderer
        │   ├── GlobalSearchBox.jsx      # Modal search bar across all platform content
        │   ├── ThemeToggle.jsx          # Dark / Light theme toggle switch button
        │   ├── Loader.jsx               # Loading spinner
        │   ├── LoadingSkeleton.jsx      # Skeleton placeholder for async content
        │   ├── ScrollToTop.jsx          # Auto-scrolls window to top on route transitions
        │   ├── EmptyState.jsx           # Empty results display
        │   └── ErrorState.jsx           # Error alert box
        │
        ├── pages/                       # User-Facing Route Views (28 Pages)
        │   ├── Home.jsx                 # Landing page with hero, features, popular courses
        │   ├── Courses.jsx              # Course catalog with filtering and pagination
        │   ├── CourseDetails.jsx        # Course page with Lectures, Notes, Tasks, MCQs tabs
        │   ├── CourseLectures.jsx       # YouTube lecture cinema mode + Notes/Tasks/MCQs/AI tabs
        │   ├── CourseAssessment.jsx     # Final timed course assessment & review
        │   ├── CertificateView.jsx      # Verified certificate canvas & PDF download
        │   ├── VerifyCertificate.jsx    # Public certificate verification search portal
        │   ├── StudentDashboard.jsx     # Learner dashboard with stats, continue button, badges
        │   ├── StudentCertificates.jsx  # Student's earned certificates gallery
        │   ├── SearchResults.jsx        # Search results page with categorized tabs
        │   ├── Login.jsx                # Student/Admin login form
        │   ├── Register.jsx             # New student registration form
        │   ├── VerifyOTP.jsx            # 6-digit email OTP verification form
        │   ├── Profile.jsx              # User profile details
        │   ├── MyEnrollments.jsx        # Enrolled courses list
        │   ├── Assignments.jsx          # Assignment upload and status view
        │   ├── TopicHub.jsx             # Modular topic hub page
        │   ├── Lesson.jsx               # Subtopic interactive lesson reader
        │   ├── About.jsx                # About NGSkillForge
        │   ├── Contact.jsx              # Contact & support form
        │   ├── PrivacyPolicy.jsx        # Privacy policy documentation
        │   └── Terms.jsx                # Terms of service documentation
        │
        └── admin/                       # Admin Portal Components
            ├── AdminDashboard.jsx       # Admin management hub
            ├── AdminAnalytics.jsx       # Platform analytics, revenue, enrollments, completions
            ├── ManageCourses.jsx        # Course CRUD management
            ├── ManageUsers.jsx          # User accounts management & deletion
            ├── ManageAssessments.jsx    # Assessment creation, question editor, publishing
            ├── ManageAIContent.jsx      # AI generation studio for YouTube playlists
            ├── AdminContentList.jsx     # AI content status matrix across all lectures
            ├── AdminContentReview.jsx   # Granular lecture draft review & editing
            └── ManageAssignments.jsx    # Assignment submissions review
```

---

# 4. Frontend Architecture

### Entry Point Flow
1. `frontend/index.html`: The HTML5 shell containing the `#root` mount point and font links.
2. `frontend/src/main.jsx`: The JavaScript entry point that initializes:
   - `BrowserRouter` (from `react-router-dom`)
   - `ThemeProvider` (from `ThemeContext.jsx`)
   - `AuthProvider` (from `AuthContext.jsx`)
   - `ToastContainer` (from `react-toastify`)
   - Mounts the root `<App />` component.

### Routing Architecture (`App.jsx`)
The application defines three distinct route tiers:
- **Public Platform Routes:** Accessible to guests and students (`/`, `/courses`, `/courses/:id`, `/courses/:courseId/lectures/:lectureNumber`, `/certificate/:certificateId`, `/verify-certificate`, `/login`, `/register`, `/verify-otp`, `/about`, `/contact`, `/privacy`, `/terms`).
- **Protected Learner Routes (`<ProtectedRoute />`):** Requires a valid JWT session (`/dashboard`, `/dashboard/certificates`, `/courses/:courseId/assessment`, `/assignments`, `/enrollments`, `/profile`).
- **Protected Admin Routes (`<ProtectedRoute adminOnly />`):** Requires `user.role === 'admin'` (`/admin`, `/admin/analytics`, `/admin/assessments`, `/admin/content`, `/admin/courses`, `/admin/ai-content`, `/admin/users`, `/admin/assignments`).

### State Management & Contexts
- **`AuthContext.jsx`:** Stores `user` object in state and `localStorage`. Exposes `login()`, `register()`, `logout()`, `isAuthenticated`, and `loading`. Handles JWT token persistence (`accessToken`, `refreshToken`, `user`).
- **`ThemeContext.jsx`:** Controls `theme` state (`light` or `dark`). Listens to OS-level `prefers-color-scheme` media queries, updates `document.documentElement.setAttribute('data-theme', theme)`, and saves user choice to `localStorage` under `ngskillforge-theme`.

### API Communication Layer (`api.js`)
- Configured with `baseURL = import.meta.env.VITE_API_URL || '/api'`.
- **Request Interceptor:** Automatically reads `accessToken` from `localStorage` and appends `Authorization: Bearer <token>` to headers.
- **Response Interceptor:** Detects HTTP `401 Unauthorized`. If a `refreshToken` exists, it triggers an automatic call to `POST /api/auth/refresh-token`, saves the new `accessToken`, updates the original request headers, and retries the request transparently. If refresh fails, it clears credentials.
- **`messageFrom(error)` Utility:** Robust error parser that extracts user-friendly backend error messages.

---

# 5. Backend Architecture

### Server Initialization (`app.js`)
1. **Environment & DNS:** Loads `.env` via `dotenv.config()`. Configures Google Public DNS (`dns.setServers(['8.8.8.8', '8.8.4.4'])`) to resolve MongoDB Atlas SRV connection strings reliably across all networks.
2. **CORS Security:** Configured with dynamic origin validation against `process.env.FRONTEND_URLS` (`http://localhost:5173`) with `credentials: true`.
3. **Body Parsers & Middleware:** `express.json({ limit: "1mb" })`, custom `loggerMiddleware`, and `express-rate-limit` (`authLimiter`) restricting authentication attempts to 100 requests per 15 minutes.
4. **Route Dispatching:** Mounts 17 modular route handlers under `/api/*` and `/api/v1/*`.
5. **Database Connection:** Connects to MongoDB Atlas via `mongoose.connect()`.
6. **Central Error Handler:** `errorMiddleware` intercepts all thrown errors, sanitizes stack traces in production, and sends structured JSON responses.

### Request Flow Diagram

```text
Student / Admin Browser (React 19)
       │
       │  HTTP Request (JSON / Bearer JWT)
       ▼
Axios Client (frontend/src/services/api.js)
       │
       │  REST API Call (e.g. POST /api/assessments/:id/submit)
       ▼
Express Server (backend/app.js)
       │
       ├──► Rate Limiter & Logger Middleware
       ├──► authMiddleware (Verifies JWT & attaches req.user)
       ├──► roleMiddleware (Validates role if protected)
       ├──► validationMiddleware (Validates payload structure)
       │
       ▼
Controller Layer (e.g. assessment.controller.js)
       │
       ├──► Service Layer (e.g. certificate.service.js)
       ├──► Helper Layer (e.g. courseHelper.js)
       │
       ▼
Mongoose ODM Model Layer (e.g. Assessment.js, AssessmentAttempt.js)
       │
       │  MongoDB Wire Protocol (SRV DNS Query)
       ▼
MongoDB Atlas Database Cluster
       │
       │  Document Result / Update Acknowledgment
       ▼
Controller grades data & constructs JSON response: { success: true, ... }
       │
       ▼
React UI updates state -> Renders feedback / certificates / progress
```

---

# 6. Database Configuration & Schemas

The database utilizes **MongoDB Atlas** managed through **Mongoose 9.6**.

### MongoDB Models & Schemas

```text
┌──────────────┐         1:N          ┌─────────────────┐
│     User     │─────────────────────►│   Enrollment    │
└──────┬───────┘                      └────────┬────────┘
       │                                       │
       │ 1:N                                   │ N:1
       ▼                                       ▼
┌──────────────┐         1:N          ┌─────────────────┐
│  Assessment  │◄─────────────────────│     Course      │
│   Attempt    │                      └────────┬────────┘
└──────────────┘                               │ 1:N
       ▲                                       ├───────────────────┐
       │                                       ▼                   ▼
       │ 1:N                          ┌─────────────────┐ ┌─────────────────┐
┌──────────────┐                      │     Lecture     │ │   CourseNote    │
│ Certificate  │                      └────────┬────────┘ └─────────────────┘
└──────────────┘                               │ 1:1
                                               ▼
                                      ┌─────────────────┐
                                      │ LectureContent  │
                                      └─────────────────┘
```

#### 1. `User` (`models/user.model.js`)
- `name` (String, required, 3–100 chars)
- `email` (String, required, unique, lowercase)
- `password` (String, required, select: false)
- `role` (String, enum: `["user", "admin"]`, default: `"user"`)
- `toJSON transform`: Strips `password` hash from all output JSON.

#### 2. `Otp` (`models/otp.model.js`)
- `email` (String, required)
- `otp` (String, required)
- `isVerified` (Boolean, default: false)
- `expiresAt` (Date, required, with TTL index `{ expireAfterSeconds: 0 }` for automatic MongoDB deletion after 5 minutes).

#### 3. `Course` (`models/course.model.js`)
- `title` (String, required)
- `description` (String, required)
- `instructor` (String, required)
- `price` (Number, default: 0)
- `category` (String, required)
- `level` (String, enum: `["Beginner", "Intermediate", "Advanced"]`)
- `duration` (String, required)
- `modules` (Array of Module subdocuments containing `lessons`, `tasks`, `questions`).

#### 4. `Lecture` (`models/lecture.model.js`)
- `courseId` (ObjectId ref: `Course`, required, indexed)
- `lectureNumber` (Number, required, min: 1)
- `title` (String, required)
- `youtubeVideoId` (String, required, 11-character YouTube video ID)
- `youtubeUrl` (String, required)
- `thumbnailUrl` (String)
- `duration` (String)
- `playlistId` (String)
- Compound unique index: `{ courseId: 1, lectureNumber: 1 }`.

#### 5. `CourseNote` (`models/courseNote.model.js`)
- `courseId` (ObjectId ref: `Course`, required, indexed)
- `courseSlug` (String, required, indexed)
- `courseTitle` (String, required)
- `topics` (Array of `NoteTopicSchema` subdocuments: `topicId`, `title`, `order`, `summary`, `content`, `sections`).

#### 6. `Progress` (`models/progress.model.js`)
- `userId` (ObjectId ref: `User`, required, indexed)
- `courseId` (ObjectId ref: `Course`, required, indexed)
- `lectureId` (ObjectId ref: `Lecture`, required, indexed)
- `completed` (Boolean, default: false)
- `completedAt` (Date)
- `lastAccessedAt` (Date, default: Date.now)
- Compound unique index: `{ userId: 1, lectureId: 1 }`.

#### 7. `Assessment` (`models/assessment.model.js`)
- `courseId` (ObjectId ref: `Course`, required, indexed)
- `title` (String, required)
- `description` (String)
- `status` (String, enum: `["draft", "published", "archived"]`, default: `"draft"`)
- `passingPercentage` (Number, default: 70, min: 1, max: 100)
- `timeLimitMinutes` (Number, default: 30)
- `questions` (Array of question subdocuments: `question`, `codeSnippet`, `options`, `correctAnswer`, `explanation`, `difficulty`).

#### 8. `AssessmentAttempt` (`models/assessmentAttempt.model.js`)
- `userId` (ObjectId ref: `User`, required, indexed)
- `courseId` (ObjectId ref: `Course`, required, indexed)
- `assessmentId` (ObjectId ref: `Assessment`, required, indexed)
- `attemptNumber` (Number, required, default: 1)
- `answers` (Array of answer records with `selectedOption`, `isCorrect`, `correctAnswer`, `explanation`)
- `score` (Number), `percentage` (Number), `passed` (Boolean), `timeSpentSeconds` (Number).

#### 9. `Certificate` (`models/certificate.model.js`)
- `certificateId` (String, required, unique, uppercase, indexed, e.g. `NGSF-HTML-2026-X8K92L`)
- `userId` (ObjectId ref: `User`, required, indexed)
- `courseId` (ObjectId ref: `Course`, required, indexed)
- `studentName` (String, required)
- `courseName` (String, required)
- `completionDate` (Date, default: Date.now)
- `assessmentScore` (Number, required)
- Compound unique index: `{ userId: 1, courseId: 1 }` (guarantees strictly one certificate per student per course).

#### 10. `StudentAchievement` (`models/studentAchievement.model.js`)
- `userId` (ObjectId ref: `User`, required, indexed)
- `achievementKey` (String, enum: `["FIRST_LECTURE", "TEN_LECTURES", "FIRST_ASSESSMENT", "FIRST_COURSE"]`)
- `title` (String), `description` (String), `icon` (String), `earnedAt` (Date).

#### 11. `LectureContent` (`models/lectureContent.model.js`)
- `lectureId` (ObjectId ref: `Lecture`), `courseId` (ObjectId ref: `Course`), `lectureNumber` (Number), `status` (`draft` | `published`), `structuredNotes`, `tasks`, `mcqs`.

#### 12. `LectureTranscript` (`models/lectureTranscript.model.js`)
- `lectureId`, `videoId`, `transcriptText`, `segments` (`text`, `start`, `duration`), `characterCount`.

#### 13. `Enrollment` (`models/enrollment.model.js`)
- `user` (ObjectId ref: `User`), `course` (ObjectId ref: `Course`), `completedLessons`, `progress`, `courseCompleted`, `assessmentPassed`, `bestAssessmentScore`.

#### 14. `Assignment` (`models/assignment.model.js`)
- `title`, `description`, `fileName`, `fileUrl`, `publicId`, `uploadedBy`, `course`.

---

# 7. Authentication Flow & Security

### 1. Registration Flow (with Email OTP)
1. **User enters email on `/register`:** Client calls `POST /api/auth/send-otp`.
2. **Backend OTP generation (`auth.controller.js`):** Generates 6-digit numeric OTP via `otp-generator`, saves to `Otp` model with a 5-minute expiration timestamp (`expiresAt`), and dispatches an email via Nodemailer (`transporter.sendMail`).
3. **User submits OTP on `/verify-otp`:** Client calls `POST /api/auth/verify-otp`. Backend verifies match and sets `isVerified: true`.
4. **User enters name & password:** Client calls `POST /api/auth/register`.
5. **Backend validation & hashing:** Backend checks that an `isVerified: true` record exists for the email. Hashes password using `bcrypt.hash(password, 10)`. Creates user document. If email equals `PRIMARY_ADMIN_EMAIL`, assigns `role = 'admin'`, otherwise `role = 'user'`. Deletes OTP record.

### 2. Login Flow & Dual-Token Architecture
1. **User submits credentials on `/login`:** Client calls `POST /api/auth/login` with `{ email, password }`.
2. **Password verification:** Backend queries `User.findOne({ email }).select("+password")` and executes `bcrypt.compare(password, user.password)`.
3. **Token generation:**
   - **`accessToken`:** Signed with `JWT_SECRET`, expires in **15 minutes** (used for API requests).
   - **`refreshToken`:** Signed with `JWT_SECRET`, expires in **7 days** (stored in frontend `localStorage` to request fresh access tokens).
4. **Response payload:** Returns `{ success: true, accessToken, refreshToken, user }`. Password hash is omitted.

### 3. What is a JWT in Simple Words?
A **JSON Web Token (JWT)** is a digitally signed, tamper-proof ID card. Instead of the server storing user session files in memory, the server creates a token containing the user's `id` and `role`, signs it with a secret key (`JWT_SECRET`), and gives it to the browser. Whenever the browser makes an API request, it shows this token in the `Authorization: Bearer <token>` header. The server verifies the cryptographic signature instantly without needing database session lookups.

### 4. Authentication Middleware (`auth.middleware.js`)
- Reads the `Authorization` header.
- Strips `Bearer ` prefix.
- Verifies signature using `jwt.verify(token, process.env.JWT_SECRET)`.
- Sets `req.user = decodedToken` (containing `id`, `role`).
- `optionalAuthMiddleware`: If a valid token exists, attaches `req.user`; if missing or invalid, allows the request to continue as a guest (`req.user = null`).

---

# 8. Course System

### Course Exploration Flow

```text
Course Catalog (/courses)
       │
       ▼
Course Card (CourseCard.jsx)
       │
       ▼
Course Details View (/courses/:id)
       │
       ├── Tab 1: Video Lectures (Curriculum modules & watch buttons)
       ├── Tab 2: Course Notes (12 Comprehensive topic guides)
       ├── Tab 3: Practice Tasks (Modular coding challenges)
       └── Tab 4: MCQs & Final Assessment (Knowledge checks)
```

### Course APIs
- `GET /api/courses/all-courses?page=1&limit=6&search=html&category=Frontend&level=Beginner`
- `GET /api/courses/single-course/:id`
- `GET /api/courses/:id/completion` (Returns lecture count, completion percentage, assessment status, and certificate availability).

---

# 9. YouTube Lecture System

### Architecture
All course videos are **embedded directly from YouTube** and are **NOT downloaded or stored on the application server**. This eliminates video storage costs and maximizes playback reliability.

### Lecture Workspace Components (`frontend/src/pages/CourseLectures.jsx`)
1. **Responsive Video Player:** Clean `<iframe>` embedding `https://www.youtube.com/embed/${youtubeVideoId}` with parameter flags (`autoplay=0&rel=0`).
2. **Module Accordion Sidebar:** Groups lectures into pedagogical modules (e.g. *Module 1: HTML Basics*, *Module 2: Forms & Semantic Tags*).
3. **Completion Toggle Button:** Clicking "Mark as Complete" calls `POST /api/progress/lecture/:lectureId/complete` (or `POST /api/lectures/course/:courseId/:lectureNumber/toggle-complete`), updating the database and progress bars.
4. **Lecture Tabs:**
   - **Notes Tab:** Topic lecture guide and quick references.
   - **Tasks Tab:** Hands-on exercises with solution reveal buttons.
   - **MCQs Tab:** Interactive question stepper with instant feedback.
   - **Ask AI Tab:** In-lecture Groq AI Tutor Q&A assistant.

---

# 10. Course Notes System

### Integration Architecture
The complete HTML notes from the course documentation have been converted into structured, local JSON records (`backend/seed/data/html_notes_data.json`) and stored in the **MongoDB `CourseNote` collection**. 

> **Important:** The platform serves notes **directly from its own database and API** (`/api/notes/course/:courseId`). It does **NOT** make external requests to Google Docs at runtime.

### The 12 HTML Topics

```text
HTML Course Notes
├── 01. HTML Fundamentals
├── 02. Text & Formatting
├── 03. Links & Navigation
├── 04. Images
├── 05. Lists
├── 06. Tables
├── 07. Forms
├── 08. Semantic HTML
├── 09. HTML5
├── 10. Multimedia
├── 11. Iframes & Embedding
└── 12. HTML Metadata
```

### Notes Viewer Features (`CourseNotesViewer.jsx`)
- **2-Column Responsive Layout:** Left sidebar Table of Contents with real-time topic search; right stage for formatted reading.
- **Syntax Highlighting & 1-Click Copy:** All code blocks render in a styled dark container with a language pill and a "Copy Code" button.
- **Structured Callout Cards:** Distinct styled alerts for `📖 Definition`, `💡 Example`, `🔑 Important Points`, `📝 Practice Tasks`, `⚠️ Common Mistakes`, and `🏠 Easy Analogies`.
- **Sequential Navigation:** Previous Topic / Next Topic footer controls.
- **Theme Awareness:** Adapts to Dark and Light modes using CSS variables.

---

# 11. Practice Tasks System

### Architecture
Practice tasks are embedded in:
1. `Course.modules[].tasks` (Course-level curriculum tasks)
2. `LectureContent.tasks` (AI / Admin lecture tasks)
3. `CourseNotesViewer.jsx` (Interactive note callouts)

### Data Structure
- `taskNumber` (Number)
- `title` (String)
- `level` (e.g. `"Beginner"`, `"Intermediate"`)
- `category` (e.g. `"Forms"`, `"Tables"`, `"Semantic HTML"`)
- `description` (String)
- `requirements` (Array of Strings)
- `starterCode` (String)
- `solution` (String)
- `hints` (Array of Strings)

### Student Experience
Students read the task requirements, view starter code, write their solution in their local editor, and can click "Reveal Solution" to compare their work against recommended implementations.

---

# 12. MCQ & Quiz System

### 1. In-Lecture Interactive MCQs
- Displayed in `CourseLectures.jsx` under the **MCQs Tab**.
- Multi-step interactive quiz stepper: Select option (A, B, C, D) -> Click "Submit Answer" -> Green/Red instant visual indicator -> Explanation reveals -> Click "Next Question".
- Score summary displayed upon finishing with a "Retry Quiz" option.

### 2. Final Course Assessment (`CourseAssessment.jsx`)
- **Prerequisite Enforcement:** Backend verifies `prerequisite.completedCount === prerequisite.totalCount`. If any lecture is incomplete, the assessment remains locked.
- **Timed Mode:** Optional countdown timer with automatic answer submission on expiration.
- **Server-Side Grading:** Answers are submitted to `POST /api/assessments/:assessmentId/submit`. The server compares selected indices against `correctAnswer` in the database, calculates the percentage, and determines pass/fail (`percentage >= passingPercentage`).
- **Auto-Certificate Trigger:** If `passed === true` and all lectures are complete, the backend automatically generates a verified certificate record in the `Certificate` collection.

---

# 13. Groq AI Integration & AI Studio

### Architecture

```text
React Client (CourseLectures.jsx / ManageAIContent.jsx)
       │
       ▼
Axios POST (/api/ai/lecture/:lectureId/ask or /api/ai/generate-notes)
       │
       ▼
AI Controller (backend/controllers/ai.controller.js)
       │
       ▼
AI Tutor / Content Service (aiTutor.service.js / aiContent.service.js)
       │
       ▼
Groq SDK Wrapper (backend/services/ai.service.js)
       │
       │  API Request (Model: qwen/qwen3.8-27b / llama-3.3-70b-versatile)
       ▼
Groq Cloud API (Ultra-Fast LPUs)
       │
       │  Chat Completion Response (JSON / Markdown)
       ▼
Backend Controller -> Validates & stores draft in LectureContent -> Sends response to React
```

### Current AI Features (Implemented in Code)
1. **In-Lecture AI Coding Tutor:** Students ask questions about the current lecture; the tutor receives the course name, lecture title, and transcript context to give tailored explanations.
2. **YouTube Closed Caption Extraction:** `transcript.service.js` fetches subtitles via `youtube-transcript` for any lecture.
3. **AI Study Notes Generator:** Generates structured educational notes with code snippets from video transcripts.
4. **AI Practice Task Generator:** Generates hands-on coding tasks with starter code, requirements, and solutions.
5. **AI MCQ Quiz Generator:** Generates multiple-choice quiz questions with answer options, correct answer index, and explanations.
6. **Rate-Limit Resilience:** `ai.service.js` features exponential backoff retries (8s, 16s) when Groq HTTP 429 rate limits are encountered.

### Planned AI Features
- Real-time in-browser code execution & automated AI test case verification.
- Personalized voice-based AI tutoring.

---

# 14. Cloudinary File Upload Integration

### Purpose & Flow
Cloudinary is used to store assignment attachments submitted by administrators and students.
1. **Frontend:** User selects a file (PDF, PNG, JPG, MP4 up to 5MB) in a multipart `<form>`.
2. **Multer Buffering (`upload.middleware.js`):** Intercepts `req.file`, verifies mimetype and size limit, and temporarily writes the file to the local `uploads/` folder.
3. **Cloudinary Upload (`assignment.controller.js`):** Calls `cloudinary.v2.uploader.upload(req.file.path, { folder: "assignments" })`.
4. **Database Record:** Backend stores the secure CDN URL (`result.secure_url`) and public ID (`result.public_id`) in the `Assignment` MongoDB collection.
5. **Cleanup:** Backend deletes the local temporary file using `fs.unlink(req.file.path)`.
6. **Deletion:** When an assignment is deleted, backend deletes the file from Cloudinary using `cloudinary.uploader.destroy(assignment.publicId)`.

---

# 15. Complete API Documentation

### Public & Authentication Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Auth Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Server & DB health check | None | `{ success: true, database: "connected" }` | None |
| `POST` | `/api/auth/send-otp` | Sends 6-digit email OTP | `{ email }` | `{ success: true, message: "OTP sent" }` | None |
| `POST` | `/api/auth/verify-otp` | Validates registration OTP | `{ email, otp }` | `{ success: true, message: "OTP verified" }` | None |
| `POST` | `/api/auth/register` | Registers new user | `{ name, email, password }` | `{ success: true, token, user }` | None (Verified OTP) |
| `POST` | `/api/auth/login` | Authenticates user | `{ email, password }` | `{ success: true, accessToken, refreshToken, user }` | None |
| `POST` | `/api/auth/refresh-token` | Exchanges refresh token for new access token | `{ token: "<refreshToken>" }` | `{ success: true, accessToken }` | None |
| `POST` | `/api/auth/logout` | Discards active session | None | `{ success: true, message: "Logout successful" }` | None |

### Course, Notes & Lecture Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Auth Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/courses/all-courses` | Catalog with search & pagination | Query: `?page=1&limit=6&search=&category=&level=` | `{ courses, totalCourses, totalPages }` | None |
| `GET` | `/api/courses/single-course/:id` | Single course metadata | None | `{ success: true, course }` | None |
| `GET` | `/api/courses/:id/completion` | Course completion & prerequisite check | None | `{ lecturesCompleted, totalLectures, isPrerequisiteMet, assessmentPassed }` | Optional |
| `GET` | `/api/notes/course/:courseId` | Fetches 12-topic course study notes | None | `{ success: true, topics, totalTopics }` | None |
| `GET` | `/api/notes/course/:courseId/topics/:topicId` | Fetches single topic note | None | `{ success: true, topic }` | None |
| `GET` | `/api/lectures/course/:courseId` | All lectures & module structure | None | `{ course, totalLectures, modules, lectures }` | Optional |
| `GET` | `/api/lectures/course/:courseId/:lectureNumber` | Single lecture with Notes, Tasks, MCQs | None | `{ lecture, module, content, isCompleted }` | Optional |
| `POST` | `/api/lectures/course/:courseId/:lectureNumber/toggle-complete` | Toggles lecture completion | None | `{ isCompleted, completedLectures, progressPercent }` | Optional |

### Assessments, Certificates & Dashboard

| Method | Endpoint | Purpose | Request Body | Response | Auth Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/assessments/course/:courseId` | Course assessment & attempt history | None | `{ hasAssessment, assessment, prerequisite, attempts }` | Optional |
| `POST` | `/api/assessments/:assessmentId/start` | Starts timed assessment session | None | `{ assessmentId, questions, startedAt }` | User |
| `POST` | `/api/assessments/:assessmentId/submit` | Grades submitted answers | `{ answers: [{ questionId, selectedOption }], startedAt, timeSpentSeconds }` | `{ attempt: { score, percentage, passed, certificate } }` | User |
| `GET` | `/api/certificates/my` | Fetches user's earned certificates | None | `{ certificates: [...] }` | User |
| `GET` | `/api/certificates/:certificateId` | Single certificate details | None | `{ certificate: { studentName, courseName, assessmentScore, ... } }` | Optional |
| `GET` | `/api/certificates/:certificateId/download` | Streams generated certificate PDF | None | Binary PDF Stream | None |
| `GET` | `/api/certificates/verify/:certificateId` | Public certificate verification | None | `{ valid: true, certificate: { studentName, status: "Verified Authentic" } }` | None |
| `GET` | `/api/student/dashboard` | Student dashboard overview & stats | None | `{ overview, inProgressCourses, completedCourses, certificates, achievements, recentActivity }` | User |
| `GET` | `/api/search` | Global multi-entity search | Query: `?q=javascript` | `{ courses, lectures, topics }` | Optional |

### AI Assistant & Admin Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Auth Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/lecture/:lectureId/ask` | In-lecture AI Tutor Q&A | `{ message, conversationHistory }` | `{ success: true, answer, metadata }` | Optional |
| `POST` | `/api/ai/generate-notes` | AI generates notes from transcript | `{ lectureId }` | `{ structuredNotes, markdown }` | Admin |
| `POST` | `/api/ai/generate-tasks` | AI generates coding practice tasks | `{ lectureId, count: 3 }` | `{ tasksCount, tasks }` | Admin |
| `POST` | `/api/ai/generate-mcqs` | AI generates quiz questions | `{ lectureId, count: 5 }` | `{ mcqsCount, mcqs }` | Admin |
| `GET` | `/api/admin/analytics/overview` | Platform KPI statistics | None | `{ totalUsers, totalCourses, totalEnrollments, totalCertificates }` | Admin |

---

# 16. Complete User Journey

1. **Opens Website (`/`):** The student explores the modern landing page showcasing featured courses, learning paths, and statistics.
2. **Registers (`/register`):** Enters name and email. Receives a 6-digit OTP in their inbox via Nodemailer and verifies it on `/verify-otp`. Sets a password (hashed with `bcryptjs`).
3. **Logs In (`/login`):** Receives a 15-minute `accessToken` and a 7-day `refreshToken`. Redirected to `/dashboard`.
4. **Opens Student Dashboard (`/dashboard`):** Views enrolled courses, overall completion percentages, "Continue Learning" shortcuts, recent activity timeline, and unlocked achievement badges.
5. **Browses Course Catalog (`/courses`):** Filters courses by category (Frontend, Backend, Fullstack) or difficulty (Beginner, Intermediate, Advanced) and searches keywords.
6. **Opens Course Details (`/courses/:id`):** Views course description, instructor, curriculum overview, and switches between Lectures, Notes, Tasks, and MCQs tabs.
7. **Watches YouTube Lecture (`/courses/:id/lectures/:lectureNumber`):** Watches embedded HD video in cinema mode, with automatic previous/next navigation between lectures.
8. **Reads Course Notes (`CourseDetails` -> Notes tab or in-lecture notes):** Explores the 12-topic chapter library, searches topics, and copies code snippets with one click.
9. **Completes Practice Tasks:** Reads coding challenges, attempts the exercise, and reveals the solution code.
10. **Attempts In-Lecture Quizzes:** Tests knowledge with instant MCQ feedback.
11. **Consults Groq AI Tutor:** Opens the "Ask AI" tab inside the lecture theater to clarify doubts and debug code in real time.
12. **Unlocks & Takes Final Course Assessment:** After completing 100% of video lectures, the locked assessment opens. The student completes the timed test, receives a passing score (≥ 70%), and is awarded an authentic PDF certificate.
13. **Verifies & Downloads Certificate (`/certificate/:id`):** Downloads the vector PDF and shares the public verification link (`/verify-certificate?id=...`).
14. **Logs Out:** Client clears tokens from `localStorage` and resets context state.

---

# 17. Complete Data Flow Diagrams

### A. Login & Dual-Token Authentication Flow

```text
User                  React UI                  Node / Express             MongoDB
 │                       │                            │                       │
 ├── Submits Login ─────►│                            │                       │
 │   (Email, Password)   ├── POST /api/auth/login ───►│                       │
 │                       │                            ├── User.findOne() ────►│
 │                       │                            │◄── User Doc + Hash ───┤
 │                       │                            ├── bcrypt.compare()    │
 │                       │                            ├── Sign Access Token   │
 │                       │                            ├── Sign Refresh Token  │
 │                       │◄── { accessToken, ... } ───┤                       │
 │                       ├── Stores in localStorage   │                       │
 │◄── Redirect Dashboard ┤                            │                       │
```

### B. YouTube Lecture Progress & Completion Flow

```text
Student                 React UI                     Express API              MongoDB
   │                       │                              │                      │
   ├── Watches Lecture ───►│ (Embedded YouTube iframe)    │                      │
   ├── Clicks "Complete" ─►│                              │                      │
   │                       ├── POST /complete ───────────►│                      │
   │                       │                              ├── Update Progress ──►│
   │                       │                              ├── Sync Enrollment ──►│
   │                       │◄── { isCompleted: true } ────┤                      │
   │◄── Shows Green Badge ─┤                              │                      │
```

### C. Final Assessment & Auto-Certification Flow

```text
Student                  React UI                   Express Controller         MongoDB
   │                        │                               │                     │
   ├── Clicks "Submit" ────►│                               │                     │
   │                        ├── POST /assessments/submit ──►│                     │
   │                        │   (Answers array)             ├── Grade Answers     │
   │                        │                               ├── Verify Prereq ───►│
   │                        │                               ├── Save Attempt ────►│
   │                        │                               ├── If Passed (>=70%):│
   │                        │                               │   Issue Cert ID ───►│
   │                        │                               │   Sync Enroll ─────►│
   │                        │◄── { attempt, certificate } ──┤                     │
   │◄── Confetti + Cert ────┤                               │                     │
```

### D. Course Notes System Data Flow

```text
Student                  CourseNotesViewer.jsx            Express API          MongoDB Atlas
   │                               │                           │                     │
   ├── Clicks "Notes" Tab ────────►│                           │                     │
   │                               ├── GET /api/notes/course ─►│                     │
   │                               │   (e.g. courseId="html")  ├── CourseNote.find ─►│
   │                               │                           │◄── 12 Topics JSON ──┤
   │                               │◄── { success, topics } ───┤                     │
   ├── Selects Topic 3 ───────────►│ (Links & Navigation)      │                     │
   │                               ├── Filters & Formats Text  │                     │
   │                               ├── Renders Code Blocks     │                     │
   │◄── Reads Notes & Copies Code ─┤                           │                     │
```

### E. Groq AI In-Lecture Q&A Flow

```text
Student                  CourseLectures (AI Tab)          Express API           Groq Cloud API
   │                               │                           │                      │
   ├── Types "Explain tags" ──────►│                           │                      │
   │                               ├── POST /api/ai/ask ──────►│                      │
   │                               │   (message + context)     ├── Prepares Prompt    │
   │                               │                           ├── Chat Completion ──►│
   │                               │                           │   (qwen3.8-27b)      │
   │                               │                           │◄── AI Response text ─┤
   │                               │◄── { answer: "..." } ─────┤                      │
   │◄── Reads Instant AI Answer ───┤                           │                      │
```

---

# 18. Environment Variables

### Backend `.env` Configuration (`backend/.env`)

```env
# Server Network Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URLS=http://localhost:5173

# Database & Security
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ngskillforge?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_min_32_characters

# Primary Admin Email (Automatically gets 'admin' role upon registration)
PRIMARY_ADMIN_EMAIL=admin@example.com

# Rate Limiting
AUTH_RATE_WINDOW_MS=900000
AUTH_RATE_LIMIT=100

# Nodemailer SMTP Configuration (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password

# Cloudinary Cloud Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Groq AI Service Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=qwen/qwen3.8-27b
```

### Frontend `.env` Configuration (`frontend/.env`)

```env
# Backend API Base URL
VITE_API_URL=http://localhost:5000/api
```

---

# 19. Installation & Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB Atlas** account or local MongoDB instance
- **Groq Cloud API Key** (Free tier from [console.groq.com](https://console.groq.com))
- **Gmail Account with App Password** (for OTP delivery)
- **Cloudinary Account** (for assignment file uploads)

### Step-by-Step Installation

```bash
# 1. Clone the repository
git clone https://github.com/Lucky-1300/NGSkillForge-Learning-Platform.git
cd NGSkillForge-Learning-Platform

# 2. Setup Backend Dependencies & Configuration
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT Secret, Groq Key, and Email credentials

# 3. Seed Course Notes & Courses in Database
npm run seed:all
node seed/seed_html_notes.js

# 4. Setup Frontend Dependencies
cd ../frontend
npm install
```

---

# 20. Running the Project

### Development Mode

**Terminal 1 (Backend Server):**
```bash
cd backend
npm run dev
# Starts backend with nodemon on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Starts Vite dev server on http://localhost:5173
```

- **Frontend URL:** `http://localhost:5173`
- **Backend API URL:** `http://localhost:5000/api`
- **Health Check Endpoint:** `http://localhost:5000/api/health`

---

# 21. Deployment Guide

- **Frontend Deployment (Vercel / Netlify):** Deploy `frontend` directory with build command `npm run build` and output directory `dist`. Set `VITE_API_URL=https://your-backend-domain.com/api`.
- **Backend Deployment (Render / Railway / VPS):** Deploy `backend` directory with start command `npm start` (runs `node app.js`). Provide all environment variables in the host dashboard.
- **Database (MongoDB Atlas):** Whitelist production server IPs (`0.0.0.0/0`) in MongoDB Atlas Network Access.

---

# 22. Important Files for Evaluation

| File Path | Why It Is Important | Key Concepts to Understand |
| :--- | :--- | :--- |
| `backend/app.js` | Main Express server entry point. | Route mounting, CORS origin filtering, rate limiting, Google DNS resolution, centralized error handling. |
| `backend/config/db.js` | MongoDB connection configuration. | Mongoose connection lifecycle, connection state reporting. |
| `backend/middleware/auth.middleware.js` | Core authentication & authorization security. | JWT decoding, Bearer token extraction, guest vs authenticated request handling. |
| `backend/controllers/auth.controller.js` | Complete auth lifecycle handler. | OTP generation/verification, bcrypt hashing, dual JWT issuance, refresh token rotation. |
| `backend/controllers/course.controller.js` | Course data, catalog, and topic management. | MongoDB pagination (`skip`/`limit`), regex title filtering, curriculum resolution. |
| `backend/controllers/lecture.controller.js` | YouTube lecture theater & progress tracking. | Module grouping, sequential lecture ordering, completion state toggling. |
| `backend/controllers/courseNote.controller.js` | 12-topic Course Notes provider. | Safe slug/ObjectId querying, serving structured chapter data. |
| `backend/controllers/assessment.controller.js` | Exam taking & server-side answer grading. | Prerequisite completion validation, anti-tampering answer evaluation, auto-issuing certificates. |
| `backend/services/certificate.service.js` | PDFKit vector certificate generation. | Server-side PDF canvas streaming, cryptographic certificate ID generation. |
| `backend/services/ai.service.js` | Groq AI SDK integration. | Lazy SDK initialization, rate-limit backoff retry loop, token safety capping. |
| `backend/services/aiTutor.service.js` | In-lecture AI Tutor prompt engineering. | Injection of lecture context & transcript into AI prompt for precise answers. |
| `frontend/src/App.jsx` | React SPA Router & route protection. | Nested routes, `ProtectedRoute` with `adminOnly` prop, fallback redirects. |
| `frontend/src/services/api.js` | Axios HTTP client & auto-refresh interceptor. | Automatic token attachment and seamless 401 token refresh retry loop. |
| `frontend/src/context/AuthContext.jsx` | Global authentication state store. | Storing user & tokens in `localStorage`, persistent session across page reloads. |
| `frontend/src/context/ThemeContext.jsx` | Global Dark/Light theme manager. | Custom CSS properties, OS color scheme detection, theme toggle persistence. |
| `frontend/src/pages/CourseDetails.jsx` | Main course page with 4 top-level tabs. | Tabbed UI switching between Lectures, Notes, Tasks, and MCQs; progress banner. |
| `frontend/src/pages/CourseLectures.jsx` | YouTube cinema player & lecture workspace. | Iframe video embedding, module accordions, in-player AI tutor chat, MCQ stepper. |
| `frontend/src/components/CourseNotesViewer.jsx` | 12-topic course documentation reader. | 2-column layout, live TOC search, code copy button, callout parser. |
| `frontend/src/pages/CourseAssessment.jsx` | Timed final examination interface. | Countdown timer, question palette, option selection, detailed results review. |
| `frontend/src/pages/CertificateView.jsx` | Verified certificate display & PDF download. | Presentation canvas, shareable verification URL generator. |
| `frontend/src/pages/StudentDashboard.jsx` | Learner analytics & gamification hub. | Aggregated statistics, "Continue Learning" jump button, achievement badge grid. |

---

# 23. Evaluation & Viva Preparation Q&A

### Category A: Project Architecture & System Design
- **Q: What is the architectural design pattern of NGSkillForge?**  
  *Answer:* NGSkillForge follows the **MERN** (MongoDB, Express, React, Node.js) Single Page Application (SPA) architecture with a layered **Controller-Service-Model** pattern on the backend and a **Component-Context-Hook** pattern on the frontend.  
  *File:* `backend/app.js`, `frontend/src/App.jsx`

- **Q: Why are YouTube videos not downloaded and stored on your server?**  
  *Answer:* Storing video files on the application server consumes massive storage and bandwidth. By embedding YouTube videos via `<iframe>`, we offload streaming infrastructure to YouTube while maintaining 100% control over course structure, notes, progress, and assessments.  
  *File:* `backend/models/lecture.model.js`, `frontend/src/pages/CourseLectures.jsx`

### Category B: React & Frontend
- **Q: How does the application handle authentication state without losing session on refresh?**  
  *Answer:* `AuthContext.jsx` initializes `user` state by reading `localStorage.getItem('user')`. When the user logs in, tokens and user details are written to `localStorage`.  
  *File:* `frontend/src/context/AuthContext.jsx`

- **Q: How does the Dark/Light theme toggle work?**  
  *Answer:* `ThemeContext.jsx` sets `data-theme="dark"` or `"light"` on the root `document.documentElement`. CSS variables defined in `theme.css` automatically adjust all component background and text colors.  
  *File:* `frontend/src/context/ThemeContext.jsx`, `frontend/src/theme.css`

### Category C: Backend & APIs
- **Q: How does Axios handle expired JWT access tokens automatically?**  
  *Answer:* In `frontend/src/services/api.js`, an Axios response interceptor catches HTTP 401 errors, calls `POST /api/auth/refresh-token` with the `refreshToken`, saves the new `accessToken`, updates the failed request's Authorization header, and retries the request seamlessly.  
  *File:* `frontend/src/services/api.js`

- **Q: Why do you configure custom Google DNS in `app.js`?**  
  *Answer:* `dns.setServers(['8.8.8.8', '8.8.4.4'])` ensures that MongoDB Atlas SRV (`mongodb+srv://`) connection strings resolve reliably across all ISP networks and development environments.  
  *File:* `backend/app.js`

### Category D: MongoDB & Database
- **Q: How do you prevent duplicate enrollments or duplicate certificates?**  
  *Answer:* Using Mongoose compound unique indexes: `{ user: 1, course: 1 }` in `enrollment.model.js` and `{ userId: 1, courseId: 1 }` in `certificate.model.js`.  
  *File:* `backend/models/enrollment.model.js`, `backend/models/certificate.model.js`

- **Q: How does the OTP collection delete expired records automatically?**  
  *Answer:* Using a MongoDB TTL index: `otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })`. MongoDB background threads automatically purge documents whose `expiresAt` timestamp has passed.  
  *File:* `backend/models/otp.model.js`

### Category E: Assessments & Certification
- **Q: How do you prevent students from cheating on the final assessment?**  
  *Answer:* Question options sent to the browser during the quiz **do not contain the correct answer**. All answers are graded securely on the backend in `assessment.controller.js`. Furthermore, students cannot start or submit an assessment unless all required lectures are marked complete.  
  *File:* `backend/controllers/assessment.controller.js`

- **Q: How is the PDF certificate generated?**  
  *Answer:* The backend uses `PDFKit` in `certificate.service.js` to draw vector borders, brand typography, student name, and a unique certificate ID, then streams the generated binary directly to the browser.  
  *File:* `backend/services/certificate.service.js`

### Category F: Groq AI Integration
- **Q: Which AI model is used and how is it called?**  
  *Answer:* We use the official `groq-sdk` with `qwen/qwen3.8-27b` (or `llama-3.3-70b-versatile`). It provides sub-second inference speeds. Rate limits are handled gracefully with exponential backoff retries.  
  *File:* `backend/services/ai.service.js`

---

# 24. "Explain My Project in 2 Minutes"

*(Spoken Script for College Viva / Presentation)*

> "Good morning, respected evaluators. My project is **NGSkillForge**, a full-stack developer learning platform built using the MERN stack—React 19, Node.js, Express 5, and MongoDB Atlas.
>
> The core problem NGSkillForge solves is that online learners currently have a fragmented experience—they watch tutorials on YouTube, search for notes elsewhere, practice code in separate tabs, and receive no verifiable credentials.
>
> In NGSkillForge, everything is unified. A student registers with 6-digit email OTP verification, enters a course, and watches curated YouTube lectures directly inside our cinema player without leaving the site. Under the lecture, they have access to **4 integrated modules**:
> 1. **Course Study Notes:** Complete 12-topic interactive notes with 1-click code copying.
> 2. **Practice Tasks:** Hands-on exercises with requirements and solution reveals.
> 3. **Interactive MCQs:** Instant quiz evaluation.
> 4. **Groq AI Coding Tutor:** Real-time conversational AI assistance.
>
> Once a student completes 100% of the lectures, they unlock the **Final Course Assessment**. The backend securely grades their answers, and if they score 70% or higher, the platform automatically generates a **verified PDF Certificate** featuring a unique ID that anyone can verify on our public `/verify-certificate` portal.
>
> All backend routes are protected with dual JWT authentication and role-based access control, and the UI features a complete dark/light theme engine. Thank you!"

---

# 25. "Explain My Project in 5 Minutes"

*(Comprehensive Presentation Script)*

> "Respected evaluators, I am excited to present **NGSkillForge Learning Platform**, a modern, full-stack educational web application designed for computer science and engineering students.
>
> ### 1. Motivation & Problem Statement
> While platforms like YouTube offer high-quality developer tutorials, they are completely passive. Students do not have structured notes, interactive practice tasks, automated knowledge evaluation, or authentic certificates. Furthermore, building custom video hosting servers incurs high bandwidth and storage costs.
>
> ### 2. Technical Architecture & Stack
> To solve this, I designed NGSkillForge using:
> - **Frontend:** React 19 SPA built with Vite, React Router v7, and Vanilla CSS design tokens supporting a persistent Dark/Light theme engine.
> - **Backend:** Node.js with Express 5 REST API, employing a clean Controller-Service-Model design pattern.
> - **Database:** MongoDB Atlas with Mongoose 9, utilizing 14 distinct schemas with compound unique indexes and TTL expiry.
> - **Security:** Email OTP verification with Nodemailer, password hashing with `bcryptjs`, and stateless dual-token JWT authentication (15-minute access tokens + 7-day refresh tokens with automated Axios interceptor rotation).
>
> ### 3. Key Subsystems
> - **YouTube Lecture Player:** Streams video playlists without server storage overhead, tracking per-lecture progress and maintaining sequential navigation.
> - **Course Notes System:** Includes complete 12-topic study notes for HTML with live search, syntax highlighting, and 1-click code copying, served directly from our MongoDB database.
> - **Interactive Tasks & MCQs:** Practice challenges with starter code and quizzes with instant visual feedback.
> - **Final Assessment & Verification:** Anti-cheat timed exams graded exclusively on the server. Scoring 70% or higher generates a verifiable vector PDF certificate via `PDFKit` with a cryptographic ID.
> - **Groq AI Coding Tutor:** Sub-second AI inference powered by `groq-sdk` providing real-time contextual help.
> - **Cloud Storage:** Assignment attachments handled via Multer and Cloudinary CDN.
>
> In conclusion, NGSkillForge provides an end-to-end, distraction-free learning ecosystem. The project is fully functional and ready for deployment."

---

# 26. "How Everything Is Connected"

```text
┌────────────────────────────────────────────────────────────────────────┐
│                         REACT 19 FRONTEND                              │
│  Pages: Home, Catalog, CourseDetails, CourseLectures, Assessment, Cert │
│  Contexts: AuthContext (JWT State), ThemeContext (Dark/Light Mode)     │
│  Components: CourseNotesViewer, NotesRenderer, GlobalSearchBox         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ Axios HTTP (Bearer JWT / JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         EXPRESS 5 REST API                             │
│  Middleware: RateLimiter, AuthMiddleware, RoleGuard, MulterUpload      │
│  Routes: /api/auth, /api/courses, /api/lectures, /api/notes, /api/ai   │
│  Controllers: auth, course, lecture, assessment, certificate, ai       │
└──────────────┬────────────────────┬────────────────────┬───────────────┘
               │                    │                    │
               ▼                    ▼                    ▼
     ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
     │  MongoDB Atlas   │ │  Groq AI Cloud   │ │  Cloudinary CDN  │
     │  (14 Collections)│ │  (AI Tutor &     │ │  (Assignment     │
     │  Users, Courses, │ │   AI Studio)     │ │   File Uploads)  │
     │  Notes, Attempts │ └──────────────────┘ └──────────────────┘
     └──────────────────┘
```

---

# 27. Common Evaluation Traps & Viva Defense

1. **"Why didn't you store videos in MongoDB GridFS or on your server?"**  
   *Defense:* Storing video files directly on web servers causes high bandwidth costs, buffering lag, and server crashes. Embedding YouTube via `<iframe>` leverages Google's global CDN for free while our backend handles what matters: authentication, notes, progress, and certification.

2. **"Can a student cheat on the assessment by inspecting the frontend network tab?"**  
   *Defense:* No. The question options sent to the browser during the quiz **do not contain the correct answer index**. When the student submits their choices, grading happens entirely on the backend in `assessment.controller.js`.

3. **"What happens if the student refreshes during an assessment?"**  
   *Defense:* The assessment start timestamp is saved, and time remaining is calculated dynamically from the server clock. When they submit, the backend validates the time spent.

4. **"Why use a Dual-Token (Access + Refresh) system instead of a single long-lived JWT?"**  
   *Defense:* If a single JWT is stolen and valid for 30 days, an attacker has access for 30 days. With dual tokens, access tokens expire in 15 minutes. The long-lived refresh token can be revoked on logout or credential change.

5. **"Do the course notes depend on Google Docs being online?"**  
   *Defense:* No. All notes were extracted and stored directly in our application's MongoDB database (`CourseNote` model) and local JSON dataset. The platform never makes external calls to Google Docs at runtime.

---

# 28. Current vs Planned Features

### Currently Implemented Features

| Feature | Description | Implementation Status |
| :--- | :--- | :--- |
| **Email OTP Registration** | 6-digit email OTP via Nodemailer & TTL index | ✅ Fully Implemented |
| **Dual JWT Authentication** | 15m access token + 7d refresh token with Axios auto-refresh | ✅ Fully Implemented |
| **Course Catalog & Search** | Pagination, category, difficulty level, and title filters | ✅ Fully Implemented |
| **YouTube Lecture Theater** | Video player with module groupings and previous/next nav | ✅ Fully Implemented |
| **12-Topic Course Notes** | Full HTML notes library with TOC, search, and 1-click code copy | ✅ Fully Implemented |
| **Practice Tasks** | Challenges with starter code, requirements, and solution toggles | ✅ Fully Implemented |
| **MCQ Quizzes** | Interactive stepper quiz with instant feedback and explanations | ✅ Fully Implemented |
| **Final Course Assessment** | Timed final exam with prerequisite checks and server-side grading | ✅ Fully Implemented |
| **PDF Certificate Issuance** | `PDFKit` vector certificate generation with unique ID verification | ✅ Fully Implemented |
| **Public Certificate Portal** | `/verify-certificate` public ID search and authenticity check | ✅ Fully Implemented |
| **Student Dashboard** | Real-time progress bars, continue learning jump, badges | ✅ Fully Implemented |
| **Groq AI Coding Tutor** | Sub-second in-lecture AI Q&A tutor (`qwen/qwen3.8-27b`) | ✅ Fully Implemented |
| **Admin AI Studio** | Generates notes, tasks, and MCQs from YouTube transcripts | ✅ Fully Implemented |
| **Cloudinary File Uploads** | Multer buffering + Cloudinary CDN storage for assignments | ✅ Fully Implemented |
| **Dark / Light Theme** | Pure CSS design tokens with `localStorage` persistence | ✅ Fully Implemented |

### Planned / Future Features

| Feature | Description | Status |
| :--- | :--- | :--- |
| **In-Browser Code Execution Sandbox** | Live sandboxed JavaScript/Python runner in browser | ⏳ Planned / Future |
| **Voice AI Tutor** | WebRTC voice interaction with Groq AI Tutor | ⏳ Planned / Future |
| **Social Learning Forums** | Student discussion forums and peer Q&A threads | ⏳ Planned / Future |
| **Payment Gateway Integration** | Razorpay / Stripe integration for premium paid courses | ⏳ Planned / Future |

---

# 29. Quick Revision Sheet

*(One-Page Cheat Sheet for Last-Minute Review)*

- **Project:** NGSkillForge Learning Platform (MERN Stack LMS).
- **Core Stack:** React 19, Vite 8, Node.js, Express 5, MongoDB Atlas, Mongoose 9.
- **Key Packages:** `groq-sdk` (AI Tutor), `pdfkit` (Certificates), `bcryptjs` (Password hashing), `jsonwebtoken` (Auth), `nodemailer` (Email OTP), `cloudinary` (Assignments), `youtube-transcript` (Captions).
- **Auth Flow:** Email -> OTP generation (5m TTL) -> Nodemailer -> OTP verify -> `bcrypt.hash(10)` -> JWT Access Token (15m) + Refresh Token (7d).
- **Course Flow:** Catalog (`/courses`) -> Details (`/courses/:id`) -> Tabs (Lectures, Notes, Tasks, MCQs) -> Lecture Cinema (`/courses/:id/lectures/:num`).
- **Notes System:** 12 structured HTML topics stored in MongoDB `CourseNote` model; served via `/api/notes/course/:id`; rendered in `CourseNotesViewer.jsx` with 1-click code copying and live search. Zero runtime dependency on Google Docs.
- **Assessment & Certification:** All lectures must be 100% complete -> Timed test -> Server grades answers -> Score ≥ 70% -> `PDFKit` generates certificate -> Unique ID verified at `/verify-certificate?id=...`.
- **AI Flow:** User question -> `aiTutor.service.js` -> `groq-sdk` (`qwen/qwen3.8-27b`) -> Instant contextual answer.
- **Commands:** Backend: `npm run dev` (Port 5000); Frontend: `npm run dev` (Port 5173).
