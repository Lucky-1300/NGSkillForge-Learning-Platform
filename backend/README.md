# NGSkillForge Learning Platform Backend

## Project Overview

NGSkillForge Learning Platform Backend is a Node.js and Express.js based REST API developed for managing an online learning platform. The backend provides authentication, authorization, course management, assignment uploads, OTP verification, enrollment management, and secure user handling.

The project follows a professional MVC architecture using MongoDB Atlas for database management and Cloudinary for cloud-based file storage.

---

# Features

## Authentication & Authorization

* User Registration
* User Login
* JWT Authentication
* Refresh Token System
* Logout API
* OTP Email Verification using Nodemailer
* Role-Based Access Control (Admin/User)
* Protected Routes

## User Management

* Get User Profile
* Admin View All Users
* Admin Delete User

## Course Management

* Create Course
* Update Course
* Delete Course
* Get Single Course
* Get All Courses
* Pagination
* Search Functionality
* Filtering

## Assignment Management

* Upload Assignments
* Cloudinary File Storage
* Retrieve Assignments
* Delete Assignments
* Multer File Validation

## Enrollment System

* Enroll in Courses
* Get User Enrollments

## Middleware

* Validation Middleware
* Authentication Middleware
* Role Middleware
* Logger Middleware
* Global Error Middleware

---

# Tech Stack

## Backend

* Node.js
* Express.js

## Database

* MongoDB Atlas
* Mongoose

## Authentication

* JWT
* bcryptjs

## File Upload

* Multer
* Cloudinary

## Email Service

* Nodemailer
* OTP Generator

## Logging

* Morgan

---

# Folder Structure

```bash
backend/
│
├── config/
│   ├── cloudinary.config.js
│   └── mail.config.js
│
├── controllers/
│   ├── assignment.controller.js
│   ├── auth.controller.js
│   ├── course.controller.js
│   ├── enrollment.controller.js
│   └── user.controller.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   ├── logger.middleware.js
│   ├── role.middleware.js
│   ├── upload.middleware.js
│   └── validation.middleware.js
│
├── models/
│   ├── assignment.model.js
│   ├── course.model.js
│   ├── enrollment.model.js
│   ├── otp.model.js
│   └── user.model.js
│
├── routes/
│   ├── assignment.routes.js
│   ├── auth.routes.js
│   ├── course.routes.js
│   ├── enrollment.routes.js
│   └── user.routes.js
│
├── uploads/
├── .env
├── app.js
├── package.json
└── README.md
```

---

# Installation & Setup

## Clone Repository

```bash
git clone <repository-url>
```

## Move Into Project Directory

```bash
cd backend
```

## Install Dependencies

```bash
npm install
```

## Create .env File

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email@gmail.com

EMAIL_PASS=your_gmail_app_password

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret
```

## Start Server

```bash
npm run dev
```

---

# API Endpoints

# Authentication Routes

| Method | Endpoint                |
| ------ | ----------------------- |
| POST   | /api/auth/register      |
| POST   | /api/auth/login         |
| POST   | /api/auth/send-otp      |
| POST   | /api/auth/verify-otp    |
| POST   | /api/auth/refresh-token |
| POST   | /api/auth/logout        |

---

# User Routes

| Method | Endpoint                   |
| ------ | -------------------------- |
| GET    | /api/users/profile         |
| GET    | /api/users/all-users       |
| DELETE | /api/users/delete-user/:id |

---

# Course Routes

| Method | Endpoint                       |
| ------ | ------------------------------ |
| POST   | /api/courses/create-course     |
| GET    | /api/courses/all-courses       |
| GET    | /api/courses/single-course/:id |
| PUT    | /api/courses/update-course/:id |
| DELETE | /api/courses/delete-course/:id |

---

# Assignment Routes

| Method | Endpoint                               |
| ------ | -------------------------------------- |
| POST   | /api/assignments/upload-assignment     |
| GET    | /api/assignments/all-assignments       |
| GET    | /api/assignments/single-assignment/:id |
| DELETE | /api/assignments/delete-assignment/:id |

---

# Enrollment Routes

| Method | Endpoint                        |
| ------ | ------------------------------- |
| POST   | /api/enrollments/enroll-course  |
| GET    | /api/enrollments/my-enrollments |

---

# Authentication Flow

1. User sends OTP
2. OTP is emailed using Nodemailer
3. User verifies OTP
4. User registers account
5. User logs in
6. JWT access token generated
7. Protected routes accessed using token

---

# Security Features

* Password Hashing using bcryptjs
* JWT Authentication
* Role-Based Authorization
* Protected APIs
* File Type Validation
* File Size Validation
* OTP Expiration System
* Environment Variable Protection

---

# Future Improvements

* Forgot Password Feature
* Reset Password
* Swagger API Documentation
* Docker Deployment
* Rate Limiting
* Payment Integration
* Course Reviews & Ratings

---

# Author

Lucky Ray

---

# License

This project is created for educational and hackathon purposes.
