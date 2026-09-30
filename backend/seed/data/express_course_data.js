/**
 * Seed Data: Express.js Framework & REST APIs
 */
module.exports = {
  title: 'Express.js Framework & REST APIs',
  modules: [
    {
      title: 'Server Architecture & Routing',
      order: 1,
      description: 'Master Express.js initialization, route handling, router modularization, and URL parameter extraction.',
      lessons: [
        {
          title: 'Express Application Lifecycle & Modular Routing',
          type: 'text',
          duration: '20 mins',
          order: 1,
          content: `### 1. Express Application Lifecycle
Express is a fast, unopinionated, minimalist web framework for Node.js built around an internal middleware stack and router mechanism.

\`\`\`javascript
const express = require('express');
const app = express();

// Parse JSON incoming payloads
app.use(express.json());

// Modular Router Setup
const courseRouter = express.Router();

courseRouter.get('/', (req, res) => {
  const { category, limit = 10 } = req.query;
  res.json({ success: true, category, limit: Number(limit) });
});

courseRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ success: true, courseId: id });
});

// Mount router under prefix
app.use('/api/courses', courseRouter);

app.listen(5000, () => console.log('Server listening on port 5000'));
\`\`\`

---

### 2. Route Parameters (\`req.params\`) vs Query Strings (\`req.query\`)
- **\`req.params\`**: Identifies a specific individual resource (e.g. \`/api/courses/react-101\`).
- **\`req.query\`**: Filters, sorts, or paginates collections (e.g. \`/api/courses?category=Frontend&page=2\`).`,
          notes: `• Always mount related route endpoints inside dedicated modular express.Router() files.
• Access dynamic URL parameters using req.params.
• Access URL search queries using req.query.`,
          questions: [
            {
              id: 'q-exp-1-1-1',
              question: 'In the route /api/users/:userId/courses/:courseId, how do you access the course ID value in the request handler?',
              code: 'app.get("/api/users/:userId/courses/:courseId", (req, res) => { ... });',
              type: 'mcq',
              options: ['req.params.courseId', 'req.query.courseId', 'req.body.courseId', 'req.headers.courseId'],
              answer: 'req.params.courseId',
              explanation: 'Named route segments prefixed with a colon (:) are parsed into the req.params object.',
              category: 'Routing',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-exp-1-1-1',
              taskNumber: 1,
              title: 'Build a Modular Express Course Router',
              level: 'Level 1',
              category: 'Routing',
              description: 'Create an express.Router() with GET /, GET /:id, and POST / endpoints, using req.params, req.query, and req.body.',
              requirements: [
                'Create an express.Router() instance',
                'Implement GET / with pagination query params (page, limit)',
                'Implement GET /:id returning course by ID',
                'Implement POST / returning 201 Created status'
              ],
              example: 'router.post("/", (req, res) => res.status(201).json({ success: true, data: req.body }));',
              hints: ['Use res.status(201).json(...) for successful resource creation.'],
              starterCode: `const express = require('express');\nconst router = express.Router();\n\n// Add routes here\n\nmodule.exports = router;\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Middleware Pipeline & Error Handling',
      order: 2,
      description: 'Master the Express middleware chain, custom logging/timing middleware, and centralized error handling.',
      lessons: [
        {
          title: 'Middleware Mechanics & 4-Parameter Error Handlers',
          type: 'text',
          duration: '22 mins',
          order: 1,
          content: `### 1. The Middleware Pipeline \`(req, res, next)\`
Middleware functions have access to the request object (\`req\`), response object (\`res\`), and the next middleware function in the application’s request-response cycle (\`next\`).

\`\`\`javascript
// Custom Request Logging & Timing Middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    console.log(\`[\${req.method}] \${req.originalUrl} - \${res.statusCode} (\${elapsed}ms)\`);
  });
  next(); // Pass control to next handler in pipeline
};

app.use(requestLogger);
\`\`\`

---

### 2. Centralized Error-Handling Middleware (4 Parameters)
Express recognizes error-handling middleware by its **exact 4 arguments**: \`(err, req, res, next)\`.

\`\`\`javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});
\`\`\``,
          notes: `• Always invoke next() inside middleware unless sending a terminating response with res.send() / res.json().
• Error-handling middleware must declare exactly 4 parameters (err, req, res, next).
• Place global error handlers at the very bottom of the middleware stack after all routes.`,
          questions: [
            {
              id: 'q-exp-2-1-1',
              question: 'How does Express differentiate standard middleware from an error-handling middleware?',
              code: 'app.use((a, b, c, d) => { ... });',
              type: 'mcq',
              options: [
                'By checking function.length === 4 (taking exactly 4 parameters: err, req, res, next)',
                'By inspecting the function name',
                'By checking if app.useError() was called',
                'Through a special configuration object'
              ],
              answer: 'By checking function.length === 4 (taking exactly 4 parameters: err, req, res, next)',
              explanation: 'Express inspects the arity (parameter count) of the function. When 4 parameters are present, it is registered as an error handler.',
              category: 'Middleware',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-exp-2-1-1',
              taskNumber: 1,
              title: 'Implement an Async Error Catcher Wrapper & Global Handler',
              level: 'Level 2',
              category: 'Error Architecture',
              description: 'Create an asyncHandler higher-order function that wraps async route controllers and catches Promise rejections to pass them to next(err).',
              requirements: [
                'Write const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next)',
                'Create a global 4-parameter error middleware sending structured JSON'
              ],
              example: 'app.get("/courses", asyncHandler(async (req, res) => { const data = await Course.find(); res.json(data); }));',
              hints: ['Using Promise.resolve(fn(req, res, next)).catch(next) prevents unhandled async rejections.'],
              starterCode: `// Async Handler Utility\nconst asyncHandler = (fn) => ...;\n\n// Error Middleware\nconst errorHandler = (err, req, res, next) => ...;\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Authentication & JWT Security',
      order: 3,
      description: 'Implement secure password hashing with bcrypt, JWT token generation, Bearer extraction, and RBAC.',
      lessons: [
        {
          title: 'JWT Authentication, Bcrypt & Protected Route Guards',
          type: 'text',
          duration: '25 mins',
          order: 1,
          content: `### 1. Password Hashing with Bcrypt
Never store plaintext passwords in a database! Always use a salted, slow hashing algorithm like **bcrypt**:

\`\`\`javascript
const bcrypt = require('bcryptjs');

// Hash password on registration
const salt = await bcrypt.genSalt(12);
const hashedPassword = await bcrypt.hash(plaintextPassword, salt);

// Compare password on login
const isMatch = await bcrypt.compare(plaintextPassword, hashedPassword);
\`\`\`

---

### 2. Signing and Verifying JWTs
\`\`\`javascript
const jwt = require('jsonwebtoken');

// Sign Token
const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Auth Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user payload to request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
\`\`\``,
          notes: `• Store JWT secrets securely in environment variables; never hardcode them in source code.
• Include expiration times (e.g. expiresIn: '7d') on all generated tokens.
• Use Bearer <token> format in the HTTP Authorization header.`,
          questions: [
            {
              id: 'q-exp-3-1-1',
              question: 'Where should a client provide a JWT token when making an authenticated HTTP request?',
              code: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...',
              type: 'mcq',
              options: [
                'In the Authorization header formatted as "Bearer <token>"',
                'Inside the URL query string only',
                'In the user-agent header',
                'Inside an HTML comment'
              ],
              answer: 'In the Authorization header formatted as "Bearer <token>"',
              explanation: 'Standard REST conventions pass Bearer tokens in the HTTP Authorization header to maintain statelessness and security.',
              category: 'Security',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-exp-3-1-1',
              taskNumber: 1,
              title: 'Build Role-Based Access Control (RBAC) Middleware',
              level: 'Level 2',
              category: 'Authorization',
              description: 'Create an authorize(...roles) higher-order middleware that verifies req.user.role and returns 403 Forbidden if the user lacks the required permissions.',
              requirements: [
                'Accept rest parameter (...allowedRoles)',
                'Check if allowedRoles.includes(req.user.role)',
                'Return 403 status with descriptive error if unauthorized, else call next()'
              ],
              example: 'app.delete("/course/:id", verifyToken, authorize("admin", "instructor"), deleteCourse);',
              hints: ['Ensure verifyToken runs before authorize in the route chain.'],
              starterCode: `const authorize = (...roles) => {\n  return (req, res, next) => {\n    // Implement RBAC check\n  };\n};\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Security Hardening & Production Best Practices',
      order: 4,
      description: 'Harden Express servers with Helmet headers, strict CORS, express-rate-limit, and input sanitization.',
      lessons: [
        {
          title: 'Helmet, CORS Configuration & Rate Limiting',
          type: 'text',
          duration: '20 mins',
          order: 1,
          content: `### 1. Essential Production Security Middleware
\`\`\`javascript
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// 1. Helmet: Sets secure HTTP headers (HSTS, X-Content-Type-Options, etc.)
app.use(helmet());

// 2. Strict CORS Configuration
const allowedOrigins = ['http://localhost:5173', 'https://ngskillforge.com'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
}));

// 3. Rate Limiting: Prevent brute force and DoS attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

app.use('/api/', apiLimiter);
\`\`\``,
          notes: `• Helmet sets HTTP security headers that protect against XSS, clickjacking, and MIME-type sniffing.
• Configure CORS with an explicit whitelist rather than wildcard '*' in production.
• Rate limiting protects authentication and API endpoints from automated credential stuffing.`,
          questions: [
            {
              id: 'q-exp-4-1-1',
              question: 'Which HTTP security header set by Helmet prevents other websites from embedding your site inside an <iframe>?',
              code: 'X-Frame-Options: DENY',
              type: 'mcq',
              options: ['X-Frame-Options', 'Access-Control-Allow-Origin', 'X-DNS-Prefetch-Control', 'Strict-Transport-Security'],
              answer: 'X-Frame-Options',
              explanation: 'X-Frame-Options: DENY instructs browsers not to render the page in a <frame>, <iframe>, <embed>, or <object>, protecting against clickjacking attacks.',
              category: 'Security',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-exp-4-1-1',
              taskNumber: 1,
              title: 'Implement an Auth Rate Limiter for Login Endpoints',
              level: 'Level 2',
              category: 'Security',
              description: 'Create a strict rate limiter targeting /api/auth/login allowing a maximum of 5 attempts every 15 minutes before temporary lockout.',
              requirements: [
                'Configure express-rate-limit with windowMs = 15 * 60 * 1000 and max = 5',
                'Return 429 status code with helpful message'
              ],
              example: 'const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });',
              hints: ['Apply authLimiter specifically to the /login POST route.'],
              starterCode: `const rateLimit = require('express-rate-limit');\n\nconst authLimiter = rateLimit({\n  // Configure strict auth limiter\n});\n`,
            },
          ],
        },
      ],
    },
  ],
};
