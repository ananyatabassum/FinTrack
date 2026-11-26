# FinTrack — Personal & Shared Expense Tracker

A production-grade, full-stack **Personal & Shared Expense Tracker** web application built with **Java 21 / Spring Boot 3.4** and **React 18 / TypeScript / Tailwind CSS**. Designed with a crisp fintech UI inspired by Stripe, Linear, and Wise.

---

## Project Structure

```text
expense-tracker/
├── backend/          # Spring Boot 3.4.5 REST API (Maven, Java 21, H2 / PostgreSQL)
└── frontend/         # React 18 + Vite + TypeScript + Tailwind CSS + Recharts
```

---

## Features

- **JWT Authentication & Instant Demo Access:** Register, sign in, or click **One-Click Demo Login** (`demo@fintrack.app` / `Demo@1234`) to launch a pre-seeded workspace with 10 categories and 35 realistic transactions across the current and previous month.
- **Bento-Grid Dashboard (`/dashboard`):**
  - 4 KPI summary cards (Total Balance, Monthly Income, Monthly Expenses, Savings Rate) with period-over-period delta badges.
  - Interactive **Spending by Category** Recharts Donut chart with custom legend.
  - Interactive **Cash Flow Trend** Area/Bar chart comparing income vs. expenses.
  - **Budget Health** progress bars turning amber at 80%+ and rose with an **Over Budget** alert at 100%+.
  - **Recent Transactions** feed (latest 6 entries) with quick edit/delete actions.
- **Transaction Management (`/transactions`):** Full CRUD slide-over drawer, personal & shared (`splitWith`) expense tracking, recurring flags, multi-filter bar (keyword, type, category, payment method, date range), pagination, and **One-Click CSV Export**.
- **Budgets & Categories (`/budgets`):** Pre-populated categories, custom category creation with color/icon pickers, and inline monthly budget cap updates.
- **Analytics & Settings (`/analytics`, `/settings`):** Payment method distribution, shared/recurring commitment cards, Light & Dark theme toggle, and full ledger CSV download.

---

## Running Locally

### Prerequisites
- **Java 21** (`JAVA_HOME` configured)
- **Maven 3.9+**
- **Node.js 20+** and **npm**

### 1. Start the Backend API

```bash
cd backend
mvn spring-boot:run
```

> **Note:** The backend defaults to port **`8081`** (configurable via `SERVER_PORT`, e.g., `SERVER_PORT=8080 mvn spring-boot:run`) and uses an in-memory **H2** database with zero setup required.
> - H2 Console: `http://localhost:8081/h2-console` (JDBC URL: `jdbc:h2:mem:fintrackdb`, User: `sa`, Password: empty)
> - Health Check: `http://localhost:8081/api/health`

#### Enabling PostgreSQL (Optional)
Run with the `postgres` Spring profile and configure connection environment variables:

```bash
SPRING_PROFILES_ACTIVE=postgres \
DB_URL=jdbc:postgresql://localhost:5432/fintrack \
DB_USERNAME=postgres \
DB_PASSWORD=postgres \
mvn spring-boot:run
```

### 2. Start the Frontend App

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs at **`http://localhost:5173`** and proxies `/api/*` requests directly to `http://localhost:8081`.

---

## Running Tests & Production Builds

### Backend Integration Tests
```bash
cd backend
mvn test
```

### Frontend Type-Check & Build
```bash
cd frontend
npm run build
```

---

## Key REST Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create user & seed 10 default categories |
| `POST` | `/api/auth/login` | Authenticate & receive JWT |
| `POST` | `/api/auth/demo` | One-click demo user JWT login |
| `GET` | `/api/dashboard` | KPIs, charts, budget health & recent transactions |
| `GET` | `/api/transactions` | Paginated & filtered transactions |
| `GET` | `/api/transactions/export` | Download filtered transactions as CSV |
| `POST` | `/api/transactions` | Create transaction |
| `PUT` | `/api/transactions/{id}` | Update transaction |
| `DELETE` | `/api/transactions/{id}` | Delete transaction |
| `GET` | `/api/categories` | List categories with period spending & utilization |
| `POST` | `/api/categories` | Create custom category |
| `PATCH` | `/api/categories/{id}/budget` | Update monthly budget cap |

---

## Deploying Live (Render + Vercel)

### 1. Deploy the Backend (`/backend`) on Render
This repository includes [`render.yaml`](render.yaml) and [`backend/Dockerfile`](backend/Dockerfile):
1. Sign in to [Render](https://render.com) and click **New → Blueprint** (or **New → Web Service**).
2. Connect `ananyatabassum/FinTrack`. Render detects `render.yaml` automatically and deploys the Dockerized Spring Boot API with `/api/health` checks.
3. Copy your deployed backend URL (e.g. `https://fintrack-api.onrender.com`).

### 2. Deploy the Frontend (`/frontend`) on Vercel
This repository includes [`frontend/vercel.json`](frontend/vercel.json) for SPA routing:
1. Import `ananyatabassum/FinTrack` on [Vercel](https://vercel.com) and set **Root Directory** to `frontend`.
2. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://fintrack-api.onrender.com/api` (replace with your Render backend URL)
3. Deploy and copy your live Vercel URL (e.g. `https://fintrack-demo.vercel.app`).
4. Paste that live URL into **About → Website** on your GitHub repository page so visitors can open the live app directly from GitHub.
