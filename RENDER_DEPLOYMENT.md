# NGSkillForge — Complete Render Deployment Guide

This guide provides step-by-step instructions for deploying the **NGSkillForge Learning Platform** on Render with zero-downtime configuration, proper environment variable setup, MongoDB Atlas integration, and end-to-end verification.

---

## 1. Architecture Overview

| Component | Platform / Service Type | Production URL |
| :--- | :--- | :--- |
| **Frontend** | Render Static Site | `https://ngskillforge-frontend.onrender.com` |
| **Backend** | Render Web Service (Node.js) | `https://ngskillforge-learning-platform.onrender.com` |
| **Database** | MongoDB Atlas (M0/Dedicated Cluster) | Cloud-managed |
| **Media Storage** | Cloudinary (Files/Assignments) | Cloud-managed |
| **AI Services** | Groq Cloud API (`qwen/qwen3.8-27b`) | Cloud-managed |
| **Email Service** | Gmail SMTP (Nodemailer + App Password) | Cloud-managed |

---

## 2. Service 1: Backend Deployment (Render Web Service)

Deploy the backend first so you have an active API endpoint to connect to the frontend.

### Step-by-Step Setup:
1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`NGSkillForge-Learning-Platform`).
4. Configure the Web Service settings as follows:

| Setting | Value | Notes |
| :--- | :--- | :--- |
| **Name** | `ngskillforge-learning-platform` | Produces `https://ngskillforge-learning-platform.onrender.com` |
| **Language / Runtime** | `Node` | Node 18+ or 20+ |
| **Branch** | `main` | Production branch |
| **Root Directory** | `backend` | **Crucial:** Sets execution context to backend folder |
| **Build Command** | `npm install` | Installs dependencies from `backend/package.json` |
| **Start Command** | `npm start` | Runs `node app.js` |
| **Auto-Deploy** | `Yes` (or Manual) | Deploys on git push |
| **Health Check Path** | `/api/health` | Verifies Express & MongoDB status |

### Backend Environment Variables Checklist:

In the **Environment** tab of your Render Web Service, add the following key-value pairs:

| Key | Example Value | Description | Required? |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode and hides stack traces | **Yes** |
| `FRONTEND_URLS` | `https://ngskillforge-frontend.onrender.com,http://localhost:5173` | Allowed CORS origins (comma-separated) | **Yes** |
| `MONGO_URI` | `mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/NGSkillForge?retryWrites=true&w=majority` | Full MongoDB Atlas connection string | **Yes** |
| `JWT_SECRET` | `64_byte_random_hex_string` | Secret for signing & verifying JWTs | **Yes** |
| `PRIMARY_ADMIN_EMAIL` | `luckykumari42774@gmail.com` | Automatically grants `admin` role upon register/login | **Recommended** |
| `AUTH_RATE_WINDOW_MS` | `900000` | Rate limiter window (15 mins in ms) | Optional (default: 900000) |
| `AUTH_RATE_LIMIT` | `100` | Max requests per IP in rate window | Optional (default: 100) |
| `EMAIL_USER` | `your_gmail@gmail.com` | Gmail address for sending OTPs | **Yes** (for OTP) |
| `EMAIL_PASS` | `your_16_char_app_password` | Gmail 16-character App Password | **Yes** (for OTP) |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary Cloud Name for file uploads | **Yes** (for uploads) |
| `CLOUDINARY_API_KEY` | `your_api_key` | Cloudinary API Key | **Yes** (for uploads) |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | Cloudinary API Secret | **Yes** (for uploads) |
| `GROQ_API_KEY` | `gsk_your_groq_api_key` | Groq Cloud API Key for AI features | **Yes** (for AI) |
| `GROQ_MODEL` | `qwen/qwen3.8-27b` | Groq model selection | Optional (default: `qwen/qwen3.8-27b`) |
| `YOUTUBE_API_KEY` | `your_google_api_key` | YouTube Data API v3 key (optional fallback scraper used if missing) | Optional |

> [!IMPORTANT]
> Render automatically sets the `PORT` environment variable (typically `10000`). The backend code dynamically listens to `process.env.PORT || 5000`. You do not need to manually define `PORT` in Render.

---

## 3. Service 2: Frontend Deployment (Render Static Site)

### Step-by-Step Setup:
1. In your Render Dashboard, click **New +** → **Static Site**.
2. Connect your GitHub repository (`NGSkillForge-Learning-Platform`).
3. Configure the Static Site settings as follows:

| Setting | Value | Notes |
| :--- | :--- | :--- |
| **Name** | `ngskillforge-frontend` | Produces `https://ngskillforge-frontend.onrender.com` |
| **Branch** | `main` | Production branch |
| **Root Directory** | `frontend` | **Crucial:** Sets build context to frontend folder |
| **Build Command** | `npm install && npm run build` | Builds Vite distribution into `frontend/dist/` |
| **Publish Directory** | `dist` | Relative to the Root Directory (`frontend/dist`) |

### Single-Page Application (SPA) Routing Rewrite Rule:
Because React Router handles client-side routing, add a redirect/rewrite rule in Render to prevent 404 errors on page refreshes:
1. In your Render Static Site dashboard, navigate to **Redirects/Rewrites**.
2. Add the following rule:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`

### Frontend Environment Variables Checklist:

In the **Environment** tab of your Render Static Site, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://ngskillforge-learning-platform.onrender.com/api` | Base URL pointing to the deployed backend |

> [!WARNING]
> **Vite Environment Variables & Rebuild Requirement**:
> In Vite, `import.meta.env.VITE_*` variables are embedded into static JavaScript files during the **build step** (`npm run build`).
> If you add, change, or update `VITE_API_URL`, you **MUST trigger a Manual Deploy / Clear build cache & deploy** on Render for the changes to take effect in the browser.

---

## 4. MongoDB Atlas Configuration

### 1. Network Access (IP Whitelist):
Because Render free/starter tiers use dynamic outgoing IP addresses:
1. Go to [MongoDB Atlas Console](https://cloud.mongodb.com).
2. Under **Security**, click **Network Access**.
3. Click **Add IP Address**.
4. Select **Allow Access From Anywhere** (`0.0.0.0/0`).
5. Save changes.

### 2. Database User & Permissions:
1. Under **Security**, click **Database Access**.
2. Ensure you have a Database User created with **Read and write to any database** privileges or specific access to the `NGSkillForge` database.
3. Note the username and password.
4. If your password contains special characters (e.g. `@`, `:`, `/`, `?`, `#`, `[`, `]`, `&`, `%`), URL-encode them (e.g., replace `@` with `%40`, `#` with `%23`) or use an alphanumeric password.

### 3. Connection String Format:
```text
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/NGSkillForge?retryWrites=true&w=majority
```

---

## 5. External Credentials Setup

### Gmail App Password (OTP Verification)
Standard Google account passwords will be blocked by Gmail SMTP.
1. Enable **2-Step Verification** on your Google Account: [Google Security Settings](https://myaccount.google.com/security).
2. Go to **App Passwords**: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Under "App name", type `NGSkillForge` and click **Create**.
4. Copy the generated 16-character password (e.g. `abcd efgh ijkl mnop`).
5. Set `EMAIL_USER=your_gmail@gmail.com` and `EMAIL_PASS=abcdefghijklmnop` (without spaces) in Render Web Service.

### Groq Cloud API Key (AI Features)
1. Sign up / log into [Groq Console](https://console.groq.com).
2. Navigate to **API Keys** and generate a new key.
3. Set `GROQ_API_KEY=gsk_...` in Render Web Service.
4. Set `GROQ_MODEL=qwen/qwen3.8-27b` (or `llama-3.3-70b-versatile`).

### Cloudinary (File Uploads)
1. Log into [Cloudinary](https://cloudinary.com/console).
2. Copy **Cloud Name**, **API Key**, and **API Secret** from the Dashboard Product Environment.
3. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in Render Web Service.

---

## 6. Verification and Troubleshooting Checklist

### 1. Backend Health Check
Open `https://ngskillforge-learning-platform.onrender.com/api/health` in your browser.
- **Expected response**:
```json
{
  "success": true,
  "message": "NGSkillForge API is running",
  "database": "connected"
}
```
If `database` is `"disconnected"`, check your `MONGO_URI` credentials and IP whitelist in Atlas.

### 2. Rate Limiting & Proxy Verification
Inspect Render Web Service logs during startup.
- `app.set("trust proxy", 1)` is configured in `backend/app.js`, eliminating `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` errors.

### 3. CORS Verification
- Open your frontend site (`https://ngskillforge-frontend.onrender.com`).
- Open Developer Tools → **Console** and **Network** tabs.
- Filter by `Fetch/XHR`.
- Check requests sent to `https://ngskillforge-learning-platform.onrender.com/api/...`.
- If you see a CORS error, verify that `FRONTEND_URLS` in Render Web Service contains `https://ngskillforge-frontend.onrender.com` without spaces or protocol mismatch.

### 4. User Registration & OTP Verification
- Navigate to `https://ngskillforge-frontend.onrender.com/register`.
- Enter your email and request OTP.
- Check Render backend logs: If you see email delivery errors, verify `EMAIL_USER` and `EMAIL_PASS`.
- Check your email inbox for the 6-digit verification code.
- Complete registration.

### 5. Admin Access Verification
- Register with the email configured in `PRIMARY_ADMIN_EMAIL` (default: `luckykumari42774@gmail.com`).
- Log in. The system automatically provisions `admin` privileges, granting access to `/admin` dashboard, AI curriculum management, and analytics.

---

## 7. Redeployment Matrix

| Changed Item | Target Service | Requires Redeploy / Action |
| :--- | :--- | :--- |
| `VITE_API_URL` | Render Static Site | **Manual Deploy with "Clear build cache"** |
| `FRONTEND_URLS` | Render Web Service | Automatic restart on save |
| `MONGO_URI` | Render Web Service | Automatic restart on save |
| `JWT_SECRET` | Render Web Service | Automatic restart on save (invalidates old sessions) |
| `EMAIL_USER` / `EMAIL_PASS` | Render Web Service | Automatic restart on save |
| `GROQ_API_KEY` | Render Web Service | Automatic restart on save |
| `CLOUDINARY_*` | Render Web Service | Automatic restart on save |
| Git commit pushed to `main` | Both (if Auto-Deploy enabled) | Automatic build and deploy |
