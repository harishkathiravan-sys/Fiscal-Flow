# FiscalFlow — Complete Feature Summary

> **Accounting. Automated.**
> AI-powered Accounting SaaS built for modern finance teams.

**Repository:** https://github.com/harishkathiravan-sys/Fiscal-Flow
**Last Updated:** July 2026

---

## Overview

FiscalFlow is a full-stack AI-powered accounting SaaS application built with React 19, Node.js, Express, PostgreSQL, Prisma ORM, Tailwind CSS, and integrations with OpenAI/Gemini, Google Vision OCR, and AWS S3.

| Metric | Count |
|--------|-------|
| Total Source Files | 110 |
| Backend TypeScript Files | 43 |
| Frontend TypeScript/TSX Files | 66 |
| Prisma Models | 28 |
| Prisma Enums | 13 |
| API Endpoints | 78 |
| React Pages | 20 |
| UI Components | 28 |
| Backend Modules | 10 |
| Frontend Service Files | 11 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router 7, TanStack React Query 5, Vite 6, TypeScript 5.7, Tailwind CSS 3.4 |
| Backend | Node.js 20+, Express 4, TypeScript 5.7, Prisma 6.9, PostgreSQL, Zod 3.24 |
| Authentication | JWT (access + refresh tokens), bcrypt, role-based access (Admin/Accountant/Client) |
| AI/ML | OpenAI GPT-4o, Google Gemini 2.0 Flash, Google Vision OCR |
| File Storage | AWS S3 (presigned URLs) |
| PDF Generation | PDFKit |
| Infrastructure | Docker, Docker Compose, GitHub Actions CI |

---

## Project Structure

```
fiscalflow/
├── packages/
│   ├── backend/                          # Express API server
│   │   ├── prisma/schema.prisma          # 28 models, 13 enums
│   │   └── src/
│   │       ├── config/                   # env, database, S3, Vision
│   │       ├── middleware/               # auth, rbac, audit, errorHandler
│   │       ├── modules/
│   │       │   ├── auth/                 # Registration, JWT, RBAC
│   │       │   ├── ai/                   # AI agent + OpenAI/Gemini providers
│   │       │   ├── clients/              # Client management
│   │       │   ├── documents/            # Document center + OCR
│   │       │   ├── invoices/             # Invoice management + PDF
│   │       │   ├── expenses/             # Expense tracking
│   │       │   ├── bank/                 # Bank statement analyzer
│   │       │   ├── gst/                  # GST management
│   │       │   ├── reports/              # Financial reports
│   │       │   └── insights/             # AI insights engine
│   │       └── utils/                    # password, tokens
│   │
│   └── frontend/                         # React SPA
│       └── src/
│           ├── components/
│           │   ├── ui/                   # 12 reusable UI primitives
│           │   ├── layout/               # Sidebar, Navbar, Command Palette, AI Assistant
│           │   ├── auth/                 # ProtectedRoute, RoleGate
│           │   ├── documents/            # OcrPanel
│           │   ├── errors/               # 404, 500 pages
│           │   └── providers/            # Theme, Toast, React Query
│           ├── pages/                    # 20 page components
│           ├── services/                 # 11 API client files
│           ├── hooks/                    # React Query hooks
│           └── contexts/                 # AuthContext
│
├── .github/workflows/ci.yml            # CI pipeline
├── docker-compose.yml                  # Full stack containers
└── README.md
```

---

## Features Built

### 1. Project Foundation
- Monorepo with npm workspaces
- TypeScript everywhere (shared base config)
- ESLint + Prettier configured
- Docker + Docker Compose (PostgreSQL, API, Frontend)
- GitHub Actions CI (lint, type-check, build, Docker build)
- Environment variables (.env.example)
- Prisma ORM with PostgreSQL

### 2. Design System (20+ Components)

**Color System:**
- Emerald Green primary (50–950)
- Deep Navy secondary (50–950)
- Semantic colors (success/warning/danger/info)

**Typography:**
- Inter (UI) + JetBrains Mono (code/numbers)
- Display sizes (2XL–XS) with tight letter-spacing

**Components:**
- Button (5 variants × 3 sizes, loading, icons)
- Card (+ StatCard, CardHeader, CardTitle, CardFooter)
- Input / Textarea / Select (with labels, errors, hints, icons)
- Table (+ Header, Body, Row, Cell, Empty)
- Badge (6 variants, 2 sizes, status dot)
- Alert (4 variants, dismissable)
- Modal (+ Confirm dialog, 4 sizes)
- Skeleton (Card, Table, Stat, Page)
- Empty State
- Avatar (+ AvatarGroup)
- Logo
- Full dark mode support

### 3. Dashboard
- Professional sidebar with navigation groups
- Top navbar with search bar, theme toggle, notifications, user menu
- Command Palette (⌘K) with 14 commands
- AI Assistant panel (slide-in chat)
- 4 stat cards (Revenue, Expenses, Net Profit, Pending)
- Revenue bar chart (CSS)
- Donut chart (SVG)
- Recent activity feed (6 items)
- Upcoming tasks with priority badges
- Quick actions grid
- Cash flow sparkline

### 4. Authentication System
- Register with optional organization name
- Login with email/password
- JWT access tokens (7-day expiry)
- Refresh token rotation
- Email verification flow
- Forgot password → Reset password
- Role-Based Access Control (Admin/Accountant/Client)
- Protected routes + Guest routes
- Auth context with automatic token refresh

### 5. Client Management
- CRUD operations
- Search (name, email, GSTIN, PAN, phone)
- Filter by tags
- Pagination
- GSTIN validation (15-char regex)
- PAN validation (10-char regex)
- Dynamic contacts (add/remove, primary toggle)
- Tag system with color coding
- Client detail with contact cards, tax info, notes

### 6. Document Center
- Drag & drop file upload (50MB max)
- 7 document types (Invoice, Receipt, Bill, Purchase Order, Bank Statement, GST Document, Other)
- Folder organization (hierarchical)
- Grid / List view toggle
- File preview (images, PDFs)
- Version history tracking
- Search and type filtering
- Download from S3 presigned URLs
- AWS S3 integration

### 7. Google Vision OCR
- Auto-triggers on image/PDF upload
- Extracts 10 fields: Vendor, Invoice Number, Date, GSTIN, Subtotal, CGST, SGST, IGST, Total, HSN Code
- GST-aware field parser (multiple regex patterns)
- Confidence scoring per field
- Manual correction UI with color-coded confidence
- Polling for processing status
- Raw text viewer

### 8. AI Accounting Agent (OpenAI/Gemini)
- **Provider abstraction** — auto-selects OpenAI or Gemini, falls back automatically
- **9 AI capabilities:**
  1. 💬 Chat — general accounting Q&A
  2. 🏷️ Categorize — auto-categorize expenses (16 categories)
  3. 📒 Ledger — suggest double-entry ledger entries
  4. 🔍 Duplicates — detect duplicate invoices
  5. 🏛️ GST Check — validate GST compliance
  6. 📝 Journal — suggest journal entries with GST
  7. 📋 Notes — generate accounting period notes
  8. 💡 Explain — plain-language invoice explanation
  9. 📧 Reminders — generate payment reminder emails (3 tones)
- GST-specialized system prompt for Indian accounting

### 9. Invoice Management
- Auto-numbering (INV-0001, INV-0002, ...)
- Create with dynamic line items (HSN, GST rate)
- Real-time subtotal/GST/total calculation
- PDF generation (PDFKit, professional A4 layout)
- Status management: Pending → Partial → Paid / Cancelled
- Payment recording (auto-updates status)
- Duplicate invoices
- Email sending (modal with recipient, subject, body)
- Recurring invoices (Weekly/Biweekly/Monthly/Quarterly/Yearly)
- Stats dashboard (Total, Pending, Paid, Partial, Overdue)

### 10. Expense Management
- CRUD with 16 expense categories
- Monthly and yearly stats
- Vendor history (top 20 by spend)
- Monthly report with category breakdown
- Category-based analytics
- Search and filter by category

### 11. Bank Statement Analyzer
- CSV and PDF bank statement import
- Auto-categorization (10 transaction types)
- Subscription detection (Netflix, Spotify, etc.)
- Income/expense/subscription insights
- Category breakdown analytics
- Transaction search and filtering

### 12. GST Management
- **GST Calculator** — intra-state (CGST+SGST) and inter-state (IGST)
- **GSTIN Validation** — full 15-character format check
- **PAN Validation** — full 10-character format check
- **Due Dates** — GSTR-1 (11th), GSTR-3B (20th), GSTR-9 (annual)
- **Penalty Calculator** — late fee + interest computation
- **ITC Suggestions** — eligible/ineligible expense analysis
- **GST Summary** — output vs input tax credit

### 13. Financial Reports
- **Profit & Loss** — revenue, expenses, net profit, margin
- **Balance Sheet** — assets, liabilities, equity
- **Cash Flow** — monthly inflow/outflow/net
- **Expense Analysis** — by category with progress bars
- **Revenue Report** — monthly revenue from invoices
- **Invoice Report** — by status breakdown

### 14. AI Insights Engine
- **Cash Flow Prediction** — 30-day rolling net flow analysis
- **Late Payment Detection** — overdue invoice alerts (severity levels)
- **Expense Anomaly Detection** — 2σ statistical threshold
- **Financial Health Score** — 0–100 composite score
- Auto-generation with dismiss/read tracking
- 8 insight types with severity levels (Info/Warning/Critical)

### 15. Production Security
- **Helmet** — security headers
- **Rate Limiting** — 200 req/15min general, 20 req/15min auth
- **CORS** — configurable origin
- **Audit Logging** — action, entity, IP, user agent, timestamp
- **Activity Logging** — user action feed
- **Zod Validation** — on all API inputs
- **JWT + Refresh Tokens** — with rotation
- **Role-Based Access** — Admin/Accountant/Client hierarchy
- **Secure File Uploads** — 50MB limit, type validation
- **Password Strength** — uppercase, lowercase, number, 8+ chars
- **Email Enumeration Prevention** — same response for existing/non-existing

---

## API Endpoints (78 total)

| Module | Count | Key Endpoints |
|--------|-------|---------------|
| Auth | 9 | register, login, refresh, logout, forgot-password, reset-password, verify-email, me |
| Clients | 6 | CRUD + tags |
| Documents | 13 | CRUD + folders + upload + versions + OCR |
| AI | 9 | categorize, ledger, duplicates, GST, journal, notes, explain, reminders, chat |
| Invoices | 13 | CRUD + payments + duplicate + PDF + email + recurring + stats |
| Expenses | 7 | CRUD + stats + vendors + monthly report |
| Bank | 4 | list + subscriptions + insights + import |
| GST | 7 | calculate + validate + due-dates + penalty + ITC + summary |
| Reports | 6 | P&L, balance-sheet, cash-flow, expense-analysis, invoice-report, revenue |
| Insights | 3 | list + generate + dismiss |
| Health | 1 | status check |

---

## Database Schema (28 Models)

| Category | Models |
|----------|--------|
| Auth | User, RefreshToken, VerificationToken, PasswordReset |
| Organizations | Organization, Membership |
| Clients | Client, ClientContact, ClientTag |
| Accounting | Account, JournalEntry, JournalLine |
| Documents | Document, DocumentFolder, DocumentVersion, OcrExtraction |
| Invoices | Invoice, InvoiceItem, Payment, RecurringInvoice |
| Expenses | Expense |
| Bank | BankTransaction, BankImport |
| Security | AuditLog, ActivityLog |
| AI | AiInsight |
| Reports | Report, Comment |

---

## Frontend Pages (20 Routes)

| Route | Page | Features |
|-------|------|----------|
| `/login` | LoginPage | Split-screen branded login |
| `/register` | RegisterPage | Split-screen with stats |
| `/forgot-password` | ForgotPasswordPage | Email → success confirmation |
| `/reset-password` | ResetPasswordPage | Token-based reset form |
| `/verify-email` | VerifyEmailPage | Code entry + resend |
| `/dashboard` | DashboardPage | Stats, charts, activity, AI panel |
| `/clients` | ClientListPage | Search, filter, paginate, table |
| `/clients/new` | ClientFormPage | Multi-section create form |
| `/clients/:id` | ClientDetailPage | Profile, contacts, tax info |
| `/documents` | DocumentCenterPage | Upload, folders, grid/list, preview + OCR |
| `/ai` | AgentPage | 9 AI tool panels |
| `/invoices` | InvoiceListPage | Stats, filter, table, duplicate |
| `/invoices/new` | InvoiceFormPage | Line items, GST calc, client select |
| `/invoices/:id` | InvoiceDetailPage | Items, payments, PDF, email |
| `/expenses` | ExpenseListPage | CRUD, stats, search, categories |
| `/bank` | BankAnalyzerPage | Import, transactions, subscriptions, insights |
| `/gst` | GstToolsPage | Calculator, validation, due dates, penalty, ITC |
| `/reports` | ReportsPage | 6 report types with tabs |
| `/insights` | InsightsPage | AI insights with dismiss |
| `/design-system` | DesignSystemPage | Component showcase |

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (16+ chars) |
| `OPENAI_API_KEY` | Optional | OpenAI API for AI features |
| `GEMINI_API_KEY` | Optional | Google Gemini (fallback to OpenAI) |
| `AI_PROVIDER` | Optional | `openai` or `gemini` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Optional | Google Vision OCR |
| `AWS_ACCESS_KEY_ID` | Optional | S3 file storage |
| `AWS_SECRET_ACCESS_KEY` | Optional | S3 file storage |
| `AWS_S3_BUCKET_NAME` | Optional | S3 bucket name |
| `AWS_REGION` | Optional | S3 region |
| `REDIS_URL` | Optional | Caching/queues |
| `VITE_API_URL` | Frontend | API base URL |

---

## How to Run

```bash
# Clone
git clone https://github.com/harishkathiravan-sys/Fiscal-Flow.git
cd Fiscal-Flow

# Install
npm install

# Environment
cp .env.example .env
# Edit .env with DATABASE_URL, JWT_SECRET, and API keys

# Database
docker compose up postgres -d
cd packages/backend
npx prisma generate
npx prisma migrate dev

# Start (from root)
npm run dev
# Frontend: http://localhost:5173
# API: http://localhost:3001/api/health
```

---

## Git History

| Commit | Description |
|--------|-------------|
| `365a769` | Complete SaaS foundation — design system, auth, dashboard, clients, documents, OCR |
| `1fd28c9` | AI Accounting Agent with OpenAI/Gemini integration |
| `edf26b8` | Invoice Management, Expenses, Bank Analyzer, GST, Reports, AI Insights, Audit Logs |

---

*Built with ❤️ by Harish Kathiravan*
