/**
 * Seed Data: Full-Stack Project Lab
 */
module.exports = {
  title: 'Full-Stack Project Lab',
  modules: [
    {
      title: 'Full-Stack Architecture & Project Planning',
      order: 1,
      description: 'Master decoupled MERN stack architecture, client-server communication contracts, monorepo structures, and CORS configs.',
      lessons: [
        {
          title: 'MERN Architecture, API Contracts & Monorepo Setup',
          type: 'text',
          duration: '22 mins',
          order: 1,
          content: `### 1. The MERN Stack Architecture
The MERN stack integrates 4 industry-standard technologies:
- **MongoDB (Database)**: High-performance document database storing courses, users, and enrollments.
- **Express.js (Web Framework)**: Minimalist backend framework managing routing, middleware, and request handling.
- **React (Frontend UI)**: Component-driven single-page application framework delivering interactive user experiences.
- **Node.js (Runtime Environment)**: JavaScript runtime powering the backend server and asynchronous I/O.

\`\`\`
[ React Frontend SPA (Vite / Port 5173) ]
           │  ▲
   REST API│  │ JSON Responses / JWT Bearer
           ▼  │
[ Express & Node.js Server (Port 5000) ]
           │  ▲
   Mongoose│  │ BSON Documents
           ▼  │
[ MongoDB Atlas Database Cluster ]
\`\`\`

---

### 2. Setting Up Clean Monorepo Architecture
\`\`\`
root/
├── backend/
│   ├── config/ (db.js, cloudinary.js)
│   ├── controllers/
│   ├── middleware/ (auth.middleware.js, errorHandler.js)
│   ├── models/ (user.model.js, course.model.js)
│   ├── routes/
│   └── app.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/ (authContext.js)
│   │   ├── pages/ (Home.jsx, CourseDetails.jsx, TopicHub.jsx)
│   │   └── services/ (api.js)
│   └── index.html
└── package.json
\`\`\``,
          notes: `• Keep backend business logic in controllers and data access in models.
• Store environment variables (.env) on both frontend and backend and never commit them to git.
• Maintain a single Axios instance (api.js) on the frontend configured with baseURL and auth token interceptors.`,
          questions: [
            {
              id: 'q-fs-1-1-1',
              question: 'In a decoupled MERN application, why should API routes be prefixed with /api (e.g. /api/courses)?',
              code: 'app.use("/api/courses", courseRouter);',
              type: 'mcq',
              options: [
                'To cleanly differentiate backend JSON data endpoints from frontend Single Page Application client-side routes and static assets',
                'Because Node.js requires all routes to start with /api',
                'To automatically encrypt all network traffic',
                'It is required by MongoDB'
              ],
              answer: 'To cleanly differentiate backend JSON data endpoints from frontend Single Page Application client-side routes and static assets',
              explanation: 'Prefixing backend routes with /api enables clean reverse-proxy routing (NGINX / Vite proxy) and avoids naming collisions with frontend SPA routes.',
              category: 'Full-Stack Architecture',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-fs-1-1-1',
              taskNumber: 1,
              title: 'Configure a Unified Axios Instance with Auth Interceptors',
              level: 'Level 2',
              category: 'Frontend Service Layer',
              description: 'Create an Axios instance with base URL from environment variables, request interceptor attaching JWT Bearer tokens, and response interceptor catching 401 Unauthorized errors.',
              requirements: [
                'Use axios.create({ baseURL: import.meta.env.VITE_API_URL })',
                'Attach Authorization: Bearer <token> in interceptors.request',
                'Handle 401 errors in interceptors.response by clearing local storage and redirecting to /login'
              ],
              example: 'api.interceptors.request.use(config => { const token = localStorage.getItem("token"); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });',
              hints: ['Check if token exists in localStorage before setting header.'],
              starterCode: `import axios from 'axios';\n\nconst api = axios.create({\n  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',\n});\n\n// Configure interceptors\n\nexport default api;\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'End-to-End Authentication & Authorization System',
      order: 2,
      description: 'Implement secure registration, bcrypt password hashing, JWT creation, OTP email verification, and React auth state.',
      lessons: [
        {
          title: 'Full-Stack Auth Flow: Registration, OTP & Session Persistence',
          type: 'text',
          duration: '26 mins',
          order: 1,
          content: `### 1. The Secure Authentication Pipeline
1. **User Registers:** User submits email & password -> Backend hashes password with bcrypt -> Saves pending user -> Generates 6-digit OTP -> Sends OTP email via Nodemailer.
2. **OTP Verification:** User inputs OTP -> Backend validates TTL index & code -> Activates user -> Signs JWT token -> Returns user payload & token.
3. **Frontend Session Storage:** React AuthContext stores user & token in localStorage -> Sets Axios authorization header -> Grants access to Protected Routes.

\`\`\`jsx
// Protected Route Component (React)
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading session...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
}
\`\`\``,
          notes: `• Never store passwords in plaintext or reversible encryption formats.
• Verify JWT tokens on EVERY sensitive backend API request using middleware.
• Use React state alongside localStorage to keep auth state synchronized across tabs and components.`,
          questions: [
            {
              id: 'q-fs-2-1-1',
              question: 'Why should a frontend ProtectedRoute component store the current location in state when redirecting to /login?',
              code: '<Navigate to="/login" state={{ from: location }} replace />',
              type: 'conceptual',
              options: [],
              answer: 'It enables the login page to redirect the user back to the exact page they were originally trying to access after successful authentication.',
              explanation: 'This creates a seamless user experience so users are not always dumped back to the home page after logging in.',
              category: 'Authentication UX',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-fs-2-1-1',
              taskNumber: 1,
              title: 'Build the React AuthContext & Provider',
              level: 'Level 2',
              category: 'Full-Stack Auth',
              description: 'Implement a comprehensive React AuthContext that checks for stored token on mount, manages user and token state, and exports login, logout, and register methods.',
              requirements: [
                'Initialize state from localStorage',
                'Provide login(credentials), logout(), and register(data)',
                'Sync localStorage whenever token changes'
              ],
              example: 'export const AuthContext = createContext(); export const AuthProvider = ({ children }) => { ... };',
              hints: ['Use useEffect on mount to validate stored token with backend /api/auth/me.'],
              starterCode: `import { createContext, useContext, useState, useEffect } from 'react';\nimport api from '../services/api';\n\nconst AuthContext = createContext(null);\n\nexport function AuthProvider({ children }) {\n  // Implement auth state\n}\n\nexport const useAuth = () => useContext(AuthContext);\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'File Uploads, Cloudinary & Media Storage',
      order: 3,
      description: 'Process multipart/form-data with Multer, stream image buffers to Cloudinary CDN, and store URLs in MongoDB.',
      lessons: [
        {
          title: 'Multer Memory Storage & Cloudinary Cloud Integration',
          type: 'text',
          duration: '22 mins',
          order: 1,
          content: `### 1. Upload Pipeline: Multipart to Cloud Storage
\`\`\`javascript
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Multer with memory storage (no writing to ephemeral server disk!)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Cloudinary Upload Stream Helper
const uploadToCloudinary = (fileBuffer, folder = 'courses') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};
\`\`\``,
          notes: `• Use multer.memoryStorage() in cloud environments (Render, Heroku, AWS Lambda) where server disks are ephemeral.
• Always validate file size and mimetype on the server to prevent malicious executable uploads.
• Store the returned secure_url string in MongoDB rather than raw binary data.`,
          questions: [
            {
              id: 'q-fs-3-1-1',
              question: 'Why is memoryStorage preferred over diskStorage when uploading files in serverless or cloud container environments?',
              code: 'multer({ storage: multer.memoryStorage() })',
              type: 'conceptual',
              options: [],
              answer: 'Cloud container instances (like Render or Vercel) have ephemeral, read-only or temporary filesystems that are wiped on redeployment or scaling, so files must be streamed directly to external cloud storage (like Cloudinary or S3).',
              explanation: 'Saving files to local server disk in modern cloud deployments leads to broken image links when instances restart or scale out horizontally.',
              category: 'Cloud Storage',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-fs-3-1-1',
              taskNumber: 1,
              title: 'Build a Course Thumbnail Upload Controller Endpoint',
              level: 'Level 2',
              category: 'Media Uploads',
              description: 'Create an Express controller that receives a multipart file upload, streams it to Cloudinary, and updates the course thumbnail URL in MongoDB.',
              requirements: [
                'Check if req.file exists',
                'Upload buffer using uploadToCloudinary',
                'Update Course in MongoDB with returned secure_url',
                'Return 200 OK with updated course'
              ],
              example: 'const secureUrl = await uploadToCloudinary(req.file.buffer); course.thumbnail = secureUrl; await course.save();',
              hints: ['Use req.file.buffer with upload_stream.'],
              starterCode: `async function uploadCourseThumbnail(req, res) {\n  // Implement upload and DB update\n}\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Production Deployment, CI/CD & Performance Auditing',
      order: 4,
      description: 'Bundle production assets, configure CORS and proxy rules, deploy to Vercel/Render, and achieve 95+ Lighthouse scores.',
      lessons: [
        {
          title: 'Vite Production Builds, Environment Separation & Production Hardening',
          type: 'text',
          duration: '24 mins',
          order: 1,
          content: `### 1. Production Build & Deployment Architecture
- **Frontend (Vite React SPA)**: Built using \`npm run build\` into optimized minified HTML/CSS/JS chunks in \`dist/\`, deployed to **Vercel** or **Netlify**.
- **Backend (Express Node API)**: Deployed to **Render** or **Railway** with environment variables set in dashboard.
- **Database**: Managed on **MongoDB Atlas** with IP Access Whitelist set to allow secure connections.

---

### 2. Pre-Deployment Security & Performance Checklist
1. **Remove console.logs and debug statements.**
2. **Ensure all MongoDB queries use proper compound indexes.**
3. **Enable GZIP / Brotli compression and Helmet security headers.**
4. **Set production CORS origins to your real custom domain.**
5. **Verify that rate limiters protect all authentication and mutating routes.**`,
          notes: `• Use import.meta.env.VITE_API_URL in Vite for environment-specific backend targeting.
• Set NODE_ENV=production on backend servers to enable Express caching and suppress verbose stack traces.
• Run Google Lighthouse in Chrome DevTools to audit Performance, Accessibility, Best Practices, and SEO.`,
          questions: [
            {
              id: 'q-fs-4-1-1',
              question: 'Why should NODE_ENV be set to "production" in live backend deployments?',
              code: 'process.env.NODE_ENV = "production"',
              type: 'mcq',
              options: [
                'It enables performance caching in frameworks like Express, hides sensitive error stack traces from clients, and optimizes library execution',
                'It allows Node.js to use more CPU cores automatically',
                'It is required for MongoDB to connect',
                'It prevents JavaScript syntax errors'
              ],
              answer: 'It enables performance caching in frameworks like Express, hides sensitive error stack traces from clients, and optimizes library execution',
              explanation: 'In production mode, frameworks disable debug overhead, cache templates and view lookups, and avoid leaking internal file paths in error responses.',
              category: 'Deployment',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-fs-4-1-1',
              taskNumber: 1,
              title: 'Create a GitHub Actions CI/CD Lint and Test Workflow',
              level: 'Level 2',
              category: 'DevOps & CI/CD',
              description: 'Write a .github/workflows/deploy.yml configuration that runs on push to main, installs dependencies, lints frontend and backend, and runs build scripts.',
              requirements: [
                'Trigger on push to branches: [ main ]',
                'Set up Node.js with actions/setup-node@v4',
                'Run npm install, npm run lint, and npm run build'
              ],
              example: 'name: CI\non: [push]\njobs: build: ...',
              hints: ['Use working-directory for monorepo subfolders.'],
              starterCode: `# GitHub Actions Workflow\nname: CI Pipeline\n\non:\n  push:\n    branches: [ main ]\n\njobs:\n  build-and-test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n`,
            },
          ],
        },
      ],
    },
  ],
};
