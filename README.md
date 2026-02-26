# Emerald E-Commerce Platform

A full-stack e-commerce system built with Next.js, Node.js/Express, and MongoDB. Built as a technical assessment for Preneur Lab — evaluating API design, authentication, business logic, database modeling, frontend-backend integration, and AI-assisted development.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Seed Sample Data](#seed-sample-data)
- [Running Tests](#running-tests)
- [Docker](#docker)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [AI Tools Used](#ai-tools-used)

---

## Features

**Authentication**
- JWT-based register/login with bcrypt password hashing
- Role support: `user` and `admin`
- Google OAuth via Firebase
- Route protection middleware for both auth and admin roles

**Products**
- Full CRUD (admin only for write operations)
- Search by name, filter by price range, sort by price/newest
- Pagination support

**Cart**
- Per-user cart — add, view, remove items
- Quantity increases if product already in cart
- Quantity ceiling enforced against live stock

**Orders**
- Atomic order placement using Mongoose transactions
- Validates stock → deducts stock → snapshots price/name → clears cart
- Rollback on any failure

**Reports (Admin)**
- Total orders, total revenue, top 3 best-selling products
- Pure MongoDB aggregation pipeline — no hardcoding

**Frontend Pages**
- Homepage, Register, Login, Product List, Product Detail, Cart, Profile, Admin Panel
- Dark/Light theme toggle
- Toast notification system
- Admin dashboard: manage products, orders, users + view reports

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcrypt + Firebase Google OAuth |
| Security | Helmet, express-rate-limit |
| Testing | Jest, Supertest, mongodb-memory-server |
| Deployment | Vercel (frontend), Railway (backend) |

---

## Prerequisites

- Node.js v18+
- npm
- MongoDB Atlas account (or local MongoDB instance)
- Git

---

## Getting Started

```bash
git clone <repository-url>
cd ecommerce-assessment
```

### Backend Setup

```bash
cd backend
npm install
```

Copy the environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_long_random_secret_here
NODE_ENV=development
```

> Use `mongodb://localhost:27017/ecommerce` for a local MongoDB instance, or your MongoDB Atlas connection string.

Start the backend:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

---

### Frontend Setup

```bash
cd frontend
npm install
```

Copy the environment file:

```bash
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

> Firebase variables are optional — only required if you want Google Sign-In to work. See `.env.local.example` for all Firebase keys.

Start the frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## Seed Sample Data

To populate the database with sample products and an admin user:

```bash
cd backend
npm run seed
```

This creates:
- Admin user: `admin@example.com` / `admin123`
- 10 sample products across multiple categories

---

## Running Tests

Tests use an in-memory MongoDB replica set — no real database required.

```bash
cd backend
npm test
```

Test coverage includes:
- Auth: register, duplicate email, login, wrong password
- Products: CRUD with admin/user/no-token auth guards
- Orders: successful placement with stock deduction, insufficient stock error, cart cleared after order

---

## Docker

Build and run the backend in Docker:

```bash
cd backend
docker build -t emerald-backend .
docker run -p 5000:5000 --env-file .env emerald-backend
```

---

## Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| Backend | Railway | Set all `.env` variables in Railway dashboard |
| Frontend | Vercel | Set `NEXT_PUBLIC_API_URL` to your Railway backend URL |

---

## API Endpoints

A full Postman collection (`postman_collection.json`) is included in the repo root. Import it into Postman and set the `BASE_URL` variable to `http://localhost:5000`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login + get JWT |
| POST | `/api/auth/google` | None | Google OAuth login |
| GET | `/api/products` | None | List products (search, filter, paginate) |
| GET | `/api/products/:id` | None | Get single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/cart` | User | Get user cart |
| POST | `/api/cart` | User | Add to cart |
| DELETE | `/api/cart/:productId` | User | Remove from cart |
| POST | `/api/orders` | User | Place order (atomic) |
| GET | `/api/orders/my` | User | Get my orders |
| GET | `/api/orders` | Admin | Get all orders |
| PUT | `/api/orders/:id` | Admin | Update order status |
| GET | `/api/reports/summary` | Admin | Total orders, revenue, top products |
| GET | `/api/users` | Admin | Get all users |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for signing JWTs (use a long random string) | Yes |
| `NODE_ENV` | `development` or `production` | Yes |

### Frontend (`frontend/.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project API key | Only for Google login |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Only for Google login |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Only for Google login |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Only for Google login |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | Only for Google login |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Only for Google login |

---

## AI Tools Used

This project was built with AI-assisted development (vibe coding) as permitted by the assessment.

**Tools used:**
- **Claude (claude.ai)** — Architecture planning, database schema design, order transaction logic, MongoDB aggregation pipeline, prompt engineering
- **Antigravity AI IDE** — Code generation, editing, and debugging throughout development

**Full prompt log:** See [`AI_PROMPT_LOG.md`](./AI_PROMPT_LOG.md) for a detailed log of prompts used and what each produced.