# My Jobs Tracker 🔥

A full-stack, modern job application tracking system with an integrated Chrome Extension and AI-powered data extraction. Designed with absolutely stunning UI/UX, prioritizing glassmorphism, responsive designs, and a seamless developer experience.

## Features
- **Kanban Board**: Drag-and-drop dashboard to seamlessly move job applications across stages (Saved, Applied, Interview, Offer, Rejected, Ghosted).
- **AI Extraction**: Automatically parses job descriptions using Google Gemini 1.5 Flash to extract metadata like company name, role, location, and specific salary ranges.
- **Chrome Extension**: One-click job saving directly from LinkedIn, Indeed, Glassdoor, and other popular job boards.
- **Rate Limiting**: Built-in Arcjet sliding window rate limiter (100 requests / 15 minutes) to protect backend routes.
- **In-Memory Caching**: Custom caching utility with automatic TTL sweep intervals, entirely replacing external Redis dependencies.
- **Authentication**: Secure JWT-based authentication using HTTP-only cookies and bcrypt password hashing.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS v3, Zustand, React Router DOM, Lucide React, dnd-kit.
- **Backend**: Node.js, Express, Prisma ORM, Neon (Serverless Postgres), Arcjet (Rate Limiting), Google GenAI.
- **Extension**: Chrome Manifest V3, React, Vite, Tailwind CSS.

## Project Structure
The repository is split into three standalone applications:
```text
my-jobs-tracker/
├── backend/    # Node.js API server
├── frontend/   # React web dashboard
└── extension/  # Chrome MV3 extension
```

## Getting Started

### 1. Database Setup
You will need a PostgreSQL database. The project is optimized for [Neon](https://neon.tech/). 
Create a Neon project and get your connection string.

### 2. Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Configure your `.env` file (see `.env.example` if applicable, or set the following):
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
6. Start the development server: `npm run dev` (Runs on `http://localhost:3000`)

### 3. Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev` (Runs on `http://localhost:5173`)

### 4. Extension Setup
1. Navigate to the extension directory: `cd extension`
2. Install dependencies: `npm install`
3. Build the extension: `npm run build`
4. Open Google Chrome and navigate to `chrome://extensions/`
5. Enable **Developer mode** in the top right corner.
6. Click **Load unpacked** and select the `extension/dist` folder.
7. Pin the extension to your browser toolbar.

## Usage
1. Make sure both the backend and frontend development servers are running.
2. Sign up / log in on the web dashboard (`http://localhost:5173`).
3. Navigate to a job posting (e.g., on LinkedIn).
4. Click the Chrome extension icon and sign in if prompted.
5. Click **Save Job**! The extension will scrape the page, the backend will process the text using Gemini AI, and the job will instantly appear on your Kanban board.

---
*Built by Antigravity 👨‍🍳*
