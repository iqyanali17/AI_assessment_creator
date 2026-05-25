# AI Assessment Creator

An AI-powered assessment creation tool for teachers. Built with **Next.js** (frontend) and **Express + BullMQ** (backend), using **Google Gemini** for question paper generation.

---

## Project Structure

```
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # UI and shared components
│   │   ├── hooks/         # Custom React hooks (useSocket, useDebounce)
│   │   ├── store/         # Zustand state management
│   │   ├── lib/           # API client
│   │   └── types/         # TypeScript interfaces & enums
│   ├── public/            # Static assets
│   ├── package.json
│   └── ...config files
│
├── backend/           # Express.js backend API
│   ├── src/
│   │   ├── config/        # Environment validation (Zod)
│   │   ├── controllers/   # Route handlers
│   │   ├── routes/        # Express routers
│   │   ├── models/        # Mongoose schemas
│   │   ├── services/      # Gemini AI service
│   │   ├── workers/       # BullMQ job processors
│   │   ├── middleware/    # Security, rate limiting
│   │   ├── lib/           # MongoDB, Redis, Queue, Socket.IO, PDF
│   │   └── types/         # Shared enums
│   ├── package.json
│   └── ...config files
│
└── readme.md          # This file
```

---

## Tech Stack

| Layer     | Technology                                    |
| --------- | --------------------------------------------- |
| Frontend  | Next.js 15, React 19, TypeScript, Tailwind CSS |
| State     | Zustand                                       |
| Real-time | Socket.IO                                     |
| Backend   | Express 5, TypeScript                         |
| Database  | MongoDB (Mongoose)                            |
| Queue     | BullMQ + Redis (ioredis)                      |
| AI        | Google Gemini (`@google/generative-ai`)       |
| PDF       | Puppeteer                                     |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)
- Redis instance (local or cloud)
- Google Gemini API key

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # Fill in your credentials
npm run dev
```

The backend server starts at **http://localhost:3001** with:
- REST API
- WebSocket server (Socket.IO at `/api/socket`)
- BullMQ worker (embedded — processes AI generation jobs)

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env   # Set API URL
npm run dev
```

The frontend starts at **http://localhost:3000**.

---

## Environment Variables

### Backend (`.env`)

| Variable                | Description                          |
| ----------------------- | ------------------------------------ |
| `MONGODB_URI`           | MongoDB connection string            |
| `REDIS_URL`             | Redis connection string              |
| `GEMINI_API_KEY`        | Google Gemini API key                |
| `GEMINI_MODEL`          | Primary Gemini model                 |
| `GEMINI_FALLBACK_MODELS`| Comma-separated fallback models      |
| `NEXT_PUBLIC_APP_URL`   | Frontend URL (for CORS)              |
| `NODE_ENV`              | `development` / `production`         |

### Frontend (`.env`)

| Variable              | Description                                      |
| --------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_API_URL` | Backend API URL (REST + WebSocket), e.g. `:3001` |

---

## Architecture

```
Browser ──► Next.js (SSR/CSR) ──► Express API ──► MongoDB
                │                        │
                │ (Socket.IO)            │──► Redis + BullMQ
                │                        │
                └────────────────────────┘──► Gemini AI
```

### Flow

1. Teacher creates assignment via frontend form
2. Frontend sends POST to backend API
3. Backend stores assignment in MongoDB + queues a BullMQ job
4. Worker picks up job → calls Gemini → stores generated paper
5. WebSocket notifies frontend of completion
6. Frontend displays structured question paper
7. Optional: Export as PDF (Puppeteer renders HTML → PDF)

---

## API Endpoints

| Method | Endpoint                        | Description                |
| ------ | ------------------------------- | -------------------------- |
| POST   | `/assignments`                  | Create assignment + queue  |
| GET    | `/assignments`                  | List (paginated, filtered) |
| GET    | `/assignments/:id`              | Get single assignment      |
| PATCH  | `/assignments/:id`              | Update assignment          |
| GET    | `/assignments/:id/status`       | Get generation status      |
| GET    | `/assignments/:id/result`       | Get assignment + paper     |
| GET    | `/assignments/:id/export/pdf`   | Download PDF               |
| POST   | `/assignments/:id/regenerate`   | Re-queue generation        |
| DELETE | `/assignments/:id`              | Delete assignment + papers |
| POST   | `/generate`                     | Direct sync generation     |
| POST   | `/uploads`                      | Upload PDF/TXT file        |
| GET    | `/uploads/:id/download`         | Download uploaded file     |
| GET    | `/health`                       | Service health check       |
| GET    | `/jobs/:id`                     | Get job status             |
| DELETE | `/jobs/:id`                     | Cancel pending job         |

---

## Features

- Assignment creation with file upload, due dates, question types
- AI question generation with structured output (sections, difficulty, marks)
- Real-time status updates via WebSocket
- PDF export with proper exam-paper formatting
- Regeneration support
- Mobile-responsive UI
- Rate limiting & security headers
