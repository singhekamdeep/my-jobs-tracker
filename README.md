# My Jobs Tracker 🔥

A full-stack, modern job application tracking system with an integrated Chrome Extension and AI-powered data extraction. Designed with absolutely stunning UI/UX, prioritizing glassmorphism, responsive designs, and a seamless developer experience.

## 🚀 Live Demo & Links
- **Live Frontend (Vercel)**: [https://my-jobs-tracker.vercel.app](https://my-jobs-tracker.vercel.app)
- **Live Backend (Render)**: [https://my-jobs-tracker.onrender.com](https://my-jobs-tracker.onrender.com)
- **Download Extension**: Available directly inside the web dashboard!

## ✨ Features
- **Kanban Board**: Drag-and-drop dashboard to seamlessly move job applications across stages (Saved, Applied, Interview, Offer, Rejected, Ghosted).
- **AI Extraction**: Automatically parses job descriptions using Google Gemini 1.5 Flash to extract metadata like company name, role, location, and specific salary ranges.
- **Chrome Extension**: One-click job saving directly from LinkedIn, Indeed, Glassdoor, and other popular job boards.
- **Rate Limiting**: Built-in Arcjet sliding window rate limiter to protect backend routes from abuse.
- **In-Memory Caching**: Custom caching utility with automatic TTL sweep intervals, replacing external Redis dependencies for rapid development.
- **Authentication**: Secure JWT-based authentication using HTTP-only cookies and bcrypt password hashing.

## 🛠 Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS v3, Zustand, React Router DOM, dnd-kit. (Deployed on Vercel)
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, Neon (Serverless Postgres), Arcjet, Google GenAI. (Deployed on Render)
- **Extension**: Chrome Manifest V3, React, Vite, Tailwind CSS.

## 📂 Project Structure
The repository is logically divided into three distinct modules:

```text
my-jobs-tracker/
├── backend/
│   ├── prisma/            # Database schema and generated types
│   ├── src/
│   │   ├── controllers/   # Request handlers for applications and auth
│   │   ├── middleware/    # Auth and Arcjet rate-limiting middleware
│   │   ├── routes/        # Express router definitions
│   │   └── services/      # Business logic (e.g., Gemini AI, custom Cache)
│   └── package.json       # Backend dependencies
│
├── frontend/
│   ├── public/            # Static assets and Extension ZIP file
│   ├── src/
│   │   ├── components/    # Reusable React components (Kanban, Modal, etc.)
│   │   ├── pages/         # Route-level components (Login, Dashboard)
│   │   └── store/         # Zustand global state management
│   └── vercel.json        # Deployment configuration for React Router
│
└── extension/
    ├── public/            # Chrome manifest.json and icons
    ├── src/
    │   ├── background/    # Manifest V3 Service Worker
    │   ├── content/       # Content scripts to scrape job boards
    │   └── popup/         # React application for the extension popup UI
    └── vite.config.ts     # Multi-entry build configuration
```

## ⚙️ Getting Started (Local Development)

### 1. Database Setup
You will need a PostgreSQL database. The project is optimized for [Neon](https://neon.tech/). Create a free Neon project and copy your connection string.

### 2. Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Configure your `.env` file:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
   JWT_SECRET="your_jwt_secret"
   REFRESH_JWT_SECRET="your_refresh_jwt_secret"
   CLIENT_URL="http://localhost:5173"
   NODE_ENV="development"
   GEMINI_API_KEY="your_google_gemini_api_key"
   ARCJET_KEY="your_arcjet_key"
   ```
4. Push Prisma schema: `npx prisma db push`
5. Generate Prisma client: `npx prisma generate`
6. Start the server: `npm run dev`

### 3. Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Add `.env` file:
   ```env
   VITE_API_URL="http://localhost:3000"
   ```
4. Start the Vite development server: `npm run dev`

### 4. Extension Setup
1. Download the `job-tracker-extension.zip` from the live site, or build it manually:
   ```bash
   cd extension
   npm install
   npm run build
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the unzipped folder (or the `extension/dist` folder if you built it locally).
5. Pin the extension to your browser toolbar!

## 💡 Usage
1. Sign up on the [Live Dashboard](https://my-jobs-tracker.vercel.app).
2. Install the Chrome extension.
3. Navigate to a job posting (e.g., on LinkedIn).
4. Click the Chrome extension icon and sign in if prompted.
5. Click **Save Job**! The extension will scrape the page, the backend will process the text using Gemini AI, and the job will instantly appear on your Kanban board.

