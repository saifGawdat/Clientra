# Clientra — Modern CRM

A full-featured, open-source CRM built with Next.js 15, Prisma, and PostgreSQL. Manage your entire sales pipeline — from cold targets to closed deals — in a clean, fast, dark/light-mode interface.

---

## Features

- **Pipeline Management** — Kanban board with drag-and-drop deal stages (Lead → Qualified → Proposal → Negotiation → Won/Lost)
- **Contacts** — Full lifecycle tracking: Targets → Leads → Prospects → Customers → Churned
- **Companies** — Org profiles with linked contacts, deals, and notes
- **Deals** — Deal detail pages with activity log, notes, probability tracking, and value history
- **Opportunities** — Weighted pipeline view with close-date forecasting
- **Activities** — Calls, emails, meetings, tasks, and notes with scheduling and status tracking
- **Sales Dashboards** — Personal dashboard, team overview, pipeline funnel, and source breakdowns
- **Dark / Light Mode** — Semantic token system, persisted to `localStorage`, no flash on load
- **Authentication** — Email/password + Google OAuth, JWT sessions via `jose`
- **Role System** — `ADMIN` and `MEMBER` roles

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 |
| Database | PostgreSQL via Prisma ORM |
| Styling | Tailwind CSS v4 with semantic CSS custom properties |
| UI Components | Radix UI primitives + custom component library |
| Auth | Custom JWT auth with Google OAuth |
| Forms | React Hook Form + Zod |
| Drag & Drop | dnd-kit |
| Charts | Recharts |
| Animations | Framer Motion |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted)
- Google OAuth credentials (optional — for Google sign-in)

### 1. Clone and install

```bash
git clone https://github.com/your-username/next-crm.git
cd next-crm
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in the values in `.env` — see [Environment Variables](#environment-variables) below.

### 3. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Random secret for signing JWT sessions (min 32 chars) |
| `APP_URL` | Yes | Full URL of your app (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |

Generate a strong `AUTH_SECRET`:
```bash
openssl rand -base64 32
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login & register pages
│   ├── (dashboard)/      # All authenticated routes
│   │   ├── dashboard/    # Main overview dashboard
│   │   ├── contacts/     # Contact list & detail
│   │   ├── companies/    # Company list & detail
│   │   ├── deals/        # Deal list & detail
│   │   ├── pipeline/     # Kanban board
│   │   ├── activities/   # Activity feed
│   │   ├── targets/      # Target contacts
│   │   ├── opportunities/# Open deal pipeline
│   │   └── sales/        # Sales dashboards & overview
│   └── api/              # REST API routes
├── components/
│   ├── ui/               # Base component library
│   ├── layout/           # Sidebar, header
│   ├── deals/            # Deal-specific components
│   ├── contacts/         # Contact-specific components
│   └── ...
├── lib/
│   ├── auth.ts           # Auth helpers
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Shared utilities
├── providers/
│   └── theme-provider.tsx# Dark/light theme context
└── types/
    └── crm-types.ts      # Shared TypeScript types
```

---

## Database Schema

Core models: `User`, `Contact`, `Company`, `Deal`, `Activity`, `Note`

**Contact lifecycle:** `TARGET → LEAD → PROSPECT → CUSTOMER → CHURNED / INACTIVE`

**Deal stages:** `LEAD → QUALIFIED → PROPOSAL → NEGOTIATION → WON / LOST`

**Activity types:** `CALL`, `EMAIL`, `MEETING`, `TASK`, `NOTE`

Run Prisma Studio to browse your data:
```bash
npx prisma studio
```

---

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
npx prisma studio # Open Prisma database browser
npx prisma db push         # Sync schema to database
npx prisma generate        # Regenerate Prisma client
```

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add all environment variables in the Vercel dashboard
4. Deploy

Make sure your PostgreSQL database is accessible from Vercel's network. [Neon](https://neon.tech) and [Supabase](https://supabase.com) are good free-tier options.

### Docker / Self-hosted

```bash
npm run build
npm run start
```

Ensure `DATABASE_URL` points to your production PostgreSQL instance and `APP_URL` is set to your production domain.

---

## License

MIT
