# FiscalFlow

**Accounting. Automated.**

AI-powered Accounting SaaS built for modern finance teams.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT |
| AI | OpenAI, Gemini |
| OCR | Google Vision |
| Storage | AWS S3 |
| Infra | Docker, GitHub Actions |

## Project Structure

```
fiscalflow/
├── packages/
│   ├── backend/           # Express API server
│   │   ├── prisma/        # Database schema & migrations
│   │   └── src/
│   │       ├── config/    # Environment, database
│   │       ├── modules/   # Feature modules (auth, orgs, accounts, etc.)
│   │       ├── middleware/ # Auth, validation, error handling
│   │       ├── services/  # Business logic
│   │       ├── utils/     # Helpers
│   │       ├── types/     # Shared TypeScript types
│   │       └── index.ts   # Entry point
│   └── frontend/          # React SPA
│       └── src/
│           ├── components/ # Reusable UI components
│           ├── pages/      # Route pages
│           ├── hooks/      # Custom React hooks
│           ├── services/   # API client functions
│           ├── stores/     # State management
│           ├── types/      # TypeScript types
│           ├── utils/      # Helpers
│           └── App.tsx     # Root component
├── .github/workflows/     # CI/CD pipelines
├── docker-compose.yml     # Local dev stack
└── tsconfig.base.json     # Shared TS config
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Quick Start (Docker)

```bash
# Clone and install
git clone <repo-url> fiscalflow
cd fiscalflow
cp .env.example .env   # Edit with your values

# Start everything (DB + API + Frontend)
docker compose up -d

# Run database migrations
docker compose exec backend npx prisma migrate dev

# Open
# Frontend: http://localhost
# API:      http://localhost:3001/api/health
```

### Local Development

```bash
# 1. Start PostgreSQL (via Docker)
docker compose up postgres -d

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, etc.

# 4. Generate Prisma client & run migrations
cd packages/backend
npx prisma generate
npx prisma migrate dev

# 5. Start dev servers (from root)
npm run dev
# Backend:  http://localhost:3001
# Frontend: http://localhost:5173
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend + frontend in dev mode |
| `npm run build` | Build both packages for production |
| `npm run lint` | Lint all packages |
| `npm run format` | Format code with Prettier |
| `docker compose up -d` | Start full stack with Docker |
| `docker compose down` | Stop all containers |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-at-least-16-chars

# Optional (for AI features)
OPENAI_API_KEY=sk-...

# Optional (for OCR)
GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json

# Optional (for file storage)
AWS_S3_BUCKET_NAME=fiscalflow-uploads
```

## Database Schema

Core models:

- **User** — Auth, roles, profile
- **Organization** — Multi-tenant workspace
- **Account** — Chart of accounts (assets, liabilities, equity, revenue, expenses)
- **JournalEntry** — Double-entry bookkeeping records
- **JournalLine** — Debit/credit lines per entry
- **Document** — Uploaded files with OCR status
- **Report** — Generated financial statements

## CI/CD

GitHub Actions runs on every push/PR:

1. **Lint** — ESLint + Prettier checks
2. **Type Check** — TypeScript validation
3. **Build** — Full production build
4. **Database Tests** — Migration + integration tests
5. **Docker Build** — Container image verification

## License

Proprietary — All rights reserved.
