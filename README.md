# GuideConnect

A full-stack platform connecting tourists with verified local guides.

## Tech Stack
- **Frontend:** React + Vite + Bootstrap
- **Backend:** Node.js + Express
- **Database:** MySQL + Prisma
- **Auth:** JWT (access + refresh) + Email OTP verification
- **Payments:** Razorpay (Test Mode)

## Team
- **Naveenya** — Backend
- **Teammate** — Frontend

---

## Core Features

### 🔐 Authentication & Security
- Registration with Name, Email, Mobile, Password
- Email verification via **6-digit OTP** (2-min expiry, 30s resend cooldown, max 3 resends / 10 min)
- Secure password hashing (bcrypt)
- JWT access + refresh tokens
- Forgot / Reset password via OTP
- Optional **2FA** (TOTP authenticator) — prompted during first 3 logins
- Rate limiting on all auth endpoints
- 5 failed 2FA attempts → 10-min temporary lock

### 🧭 Tourist (User) Flow
1. Register → Verify email (OTP) → Login 
2. Browse verified guides by **city / language / price / rating**
3. View guide profile → Book a slot
4. Guide approves booking → booking confirmed
5. View bookings, chat with guide, leave review post-trip

### 🎒 Guide Flow
1. Register as guide → Verify email → Login
2. Complete **verification** (Guide License + profile) → Admin approves
3. Set availability, hourly rate, languages, service areas
4. Accept / decline booking requests
5. View earnings, payout history, and reviews

### 🛡️ Admin Flow
1. Admin login
2. Approve / reject **guide verification** requests
3. View all users, guides, bookings, payments
4. Manage disputes, refunds, and platform settings

---

## Database Schema (High-Level)

| Table | Purpose |
|---|---|
| `User` | All accounts (tourist / guide / admin) with role field |
| `GuideProfile` | Guide bio, KYC status, rates, languages, service areas |
| `Availability` | Guide's bookable slots |
| `Booking` | Tour bookings linking tourist ↔ guide |
| `Payment` | Razorpay order / transaction records |
| `Review` | Tourists' reviews of guides |
| `OTP` | Email verification + password reset codes |
| `TwoFA` | TOTP secrets and enable status |
| `AuditLog` | Security events (login, logout, 2FA failures, etc.) |

---

## System Architecture
- **Frontend** — UI, routing, form validation
- **Backend** — business logic, auth, OTP, payment verification, KYC
- **Database** — persistent storage via Prisma

---

## Main API Endpoints (Summary)

### Public
- `POST /api/auth/register`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-otp`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/refresh-token`

### Protected (JWT required)
- `GET  /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/auth/change-password`
- `GET  /api/guides` — list / search verified guides
- `GET  /api/guides/:id`
- `POST /api/bookings`
- `GET  /api/bookings` — user's bookings
- `POST /api/payments/create-order`
- `POST /api/payments/verify`

### Guide-only
- `POST /api/guide/profile`
- `PUT  /api/guide/availability`
- `POST /api/guide/bookings/:id/accept|decline`

### Admin-only
- `GET  /api/admin/guides/pending`
- `POST /api/admin/guides/:id/approve|reject`
- `GET  /api/admin/users`
- `GET  /api/admin/bookings`

---

## Setup
See **SETUP.md** for environment variables, database setup, and running instructions.

Quick start:
```bash
# Backend
cd backend && npm install && npx prisma migrate dev && npm run dev

# Frontend
cd frontend && npm install && npm run dev

---

## Login Credentials
1. **Tourist:** Username- slnaveenya@gmail.com, Password - Nave@123
2. **Guide:** Username - ravi@test.com, Password - secret123
3. **Admin:** Username - admin@guideconnect.com, Password - admin12345
