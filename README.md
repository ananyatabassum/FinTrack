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
