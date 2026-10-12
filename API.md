# GuideConnect API Contracts

**Version:** 1.0
**Base URL:** `http://localhost:5000/api`
**Last updated:** 2026-10-12
**Status:** Frozen for Modules 1–4

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Module 1 — Authentication](#2-module-1--authentication)
3. [Module 2 — Guide Profile](#3-module-2--guide-profile)
4. [Module 3 — Experiences](#4-module-3--experiences)
5. [Module 4 — Search & Recommendations](#5-module-4--search--recommendations)

---

## 1. Conventions

### 1.1 Response Envelope

**Every success response:**

```json
{
  "success": true,
  "message": "Optional human-readable message",
  "data": { }
}
```

**Every error response:**

```json
{
  "success": false,
  "message": "What went wrong",
  "code": "MACHINE_READABLE_CODE"
}
```

### 1.2 Authentication

- **Type:** JWT (JSON Web Token)
- **Header:** `Authorization: Bearer <token>`
- **Storage (frontend):** `localStorage` key `gc_token`
- **Expiry:** 7 days
- **On 401 response:** Frontend clears token + redirects to `/login`

### 1.3 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK — successful GET, PATCH |
| 201 | Created — successful POST |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (wrong role or ownership) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, double-booking, slot taken) |
| 500 | Server error |

### 1.4 Data Types

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | Integer | `1` | Auto-increment |
| `createdAt` / `updatedAt` | ISO 8601 string | `"2026-10-12T10:30:00.000Z"` | UTC |
| `price` | Integer (paise) | `80000` = ₹800 | Never float |
| `rating` | Float (1 decimal) | `4.5` | Range 0–5 |
| `role` | Enum string | `"TOURIST"` \| `"GUIDE"` \| `"ADMIN"` | Uppercase |
| `verificationStatus` | Enum string | `"NOT_SUBMITTED"` \| `"PENDING"` \| `"APPROVED"` \| `"REJECTED"` | Uppercase |
| `bookingStatus` | Enum string | see Module 5 | Uppercase |
| `category` | Enum string | `"FOOD"` \| `"HERITAGE"` \| `"SHOPPING"` \| `"CULTURE"` \| `"SIGHTSEEING"` \| `"NATURE"` \| `"OTHER"` | Uppercase |

### 1.5 Pagination

List endpoints accept `?page=1&limit=12` and return:

```json
{
  "success": true,
  "data": [ ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 87,
    "totalPages": 8
  }
}
```

### 1.6 Error Codes

```
AUTH_INVALID_CREDENTIALS
AUTH_TOKEN_MISSING
AUTH_TOKEN_EXPIRED
EMAIL_ALREADY_EXISTS
VALIDATION_FAILED
USER_NOT_FOUND
GUIDE_NOT_FOUND
EXPERIENCE_NOT_FOUND
BOOKING_NOT_FOUND
VERIFICATION_NOT_FOUND
FORBIDDEN
SLOT_UNAVAILABLE
INVALID_STATUS_TRANSITION
FILE_TOO_LARGE
UNSUPPORTED_FILE_TYPE
NOT_FOUND
SERVER_ERROR
```

---

## 2. Module 1 — Authentication

### 2.1 `POST /auth/register`

**Access:** Public

**Request body:**

```json
{
  "name": "Ananya Sharma",
  "email": "ananya@example.com",
  "password": "secret123",
  "role": "TOURIST"
}
```

**Constraints:**
- `name` — min 2 chars
- `email` — valid email format, must be unique
- `password` — min 6 chars
- `role` — must be `"TOURIST"` or `"GUIDE"` (never `"ADMIN"`)

**Response 201:**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": 1,
    "name": "Ananya Sharma",
    "email": "ananya@example.com",
    "role": "TOURIST"
  }
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_FAILED` | e.g. "Password must be at least 6 characters" |
| 409 | `EMAIL_ALREADY_EXISTS` | "Email already registered" |

---

### 2.2 `POST /auth/login`

**Access:** Public

**Request body:**

```json
{
  "email": "ananya@example.com",
  "password": "secret123"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Ananya Sharma",
      "email": "ananya@example.com",
      "role": "TOURIST"
    }
  }
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_FAILED` | "Email is required" |
| 401 | `AUTH_INVALID_CREDENTIALS` | "Invalid email or password" |

---

### 2.3 `GET /auth/me`

**Access:** Authenticated

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ananya Sharma",
    "email": "ananya@example.com",
    "role": "TOURIST"
  }
}
```

**Errors:**

| Status | Code |
|--------|------|
| 401 | `AUTH_TOKEN_MISSING` |
| 401 | `AUTH_TOKEN_EXPIRED` |

---

### 2.4 `GET /health`

**Access:** Public

**Response 200:**

```json
{
  "success": true,
  "message": "GuideConnect API is running"
}
```

---

## 3. Module 2 — Guide Profile

A guide profile is linked 1-to-1 with a `User` whose `role = "GUIDE"`. Tourists and admins do not have profiles.

### 3.1 `POST /guide/profile`

**Access:** Authenticated, role `GUIDE`

**Purpose:** Create the guide's own profile (only once).

**Request body:**

```json
{
  "bio": "Born and raised in Coimbatore. I love showing visitors the food streets and hidden temples.",
  "city": "Coimbatore",
  "country": "India",
  "languages": ["English", "Tamil"],
  "expertise": ["Food", "History"],
  "yearsOfExperience": 5,
  "hourlyRate": 80000,
  "serviceAreas": ["Coimbatore", "Ooty", "Mettupalayam"]
}
```

**Constraints:**
- `bio` — 20–1000 chars
- `city` — required
- `languages` — min 1 item
- `expertise` — min 1 item
- `hourlyRate` — optional, integer in paise
- `serviceAreas` — array of city names

**Response 201:**

```json
{
  "success": true,
  "message": "Guide profile created",
  "data": {
    "id": 1,
    "userId": 1,
    "bio": "Born and raised in Coimbatore...",
    "city": "Coimbatore",
    "country": "India",
    "languages": ["English", "Tamil"],
    "expertise": ["Food", "History"],
    "yearsOfExperience": 5,
    "hourlyRate": 80000,
    "serviceAreas": ["Coimbatore", "Ooty", "Mettupalayam"],
    "verificationStatus": "NOT_SUBMITTED",
    "avgRating": 0,
    "reviewCount": 0,
    "createdAt": "2026-10-12T10:30:00.000Z",
    "updatedAt": "2026-10-12T10:30:00.000Z"
  }
}
```

**Errors:**

| Status | Code |
|--------|------|
| 400 | `VALIDATION_FAILED` |
| 403 | `FORBIDDEN` (not a guide) |
| 409 | `VALIDATION_FAILED` (profile already exists) |

---

### 3.2 `GET /guide/profile`

**Access:** Authenticated, role `GUIDE`

**Purpose:** Get the authenticated guide's own profile.

**Response 200:** Same shape as `POST /guide/profile` response `data`.

**Errors:**

| Status | Code |
|--------|------|
| 401 | `AUTH_TOKEN_MISSING` / `AUTH_TOKEN_EXPIRED` |
| 403 | `FORBIDDEN` |
| 404 | `GUIDE_NOT_FOUND` |

---

### 3.3 `PATCH /guide/profile`

**Access:** Authenticated, role `GUIDE`

**Purpose:** Update own profile. All fields optional — send only what changed.

**Request body (any subset):**

```json
{
  "bio": "Updated bio...",
  "city": "Coimbatore",
  "languages": ["English", "Tamil", "Hindi"],
  "expertise": ["Food", "History", "Culture"],
  "hourlyRate": 100000,
  "serviceAreas": ["Coimbatore", "Ooty"]
}
```

**Response 200:** Same shape as `GET /guide/profile`.

**Errors:**

| Status | Code |
|--------|------|
| 400 | `VALIDATION_FAILED` |
| 403 | `FORBIDDEN` |
| 404 | `GUIDE_NOT_FOUND` |

---

### 3.4 `GET /guides`

**Access:** Public

**Purpose:** Search and list guide profiles.

**Query params (all optional):**

| Param | Type | Description |
|-------|------|-------------|
| `city` | string | Filter by city or service area |
| `language` | string | Filter by language spoken |
| `expertise` | string | Filter by expertise tag |
| `minRating` | number | Minimum average rating (0–5) |
| `maxPrice` | integer (paise) | Maximum hourly rate |
| `verifiedOnly` | boolean | Only show verified guides |
| `q` | string | Free-text search on name/bio |
| `page` | integer | Default `1` |
| `limit` | integer | Default `12`, max `50` |
| `sort` | string | `rating` \| `price_asc` \| `price_desc` \| `newest` (default `rating`) |

**Example:**

```
GET /api/guides?city=Coimbatore&language=English&verifiedOnly=true&page=1&limit=12
```

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 5,
      "name": "Ravi Kumar",
      "avatarUrl": "https://res.cloudinary.com/.../ravi.jpg",
      "bio": "Born and raised in Coimbatore...",
      "city": "Coimbatore",
      "country": "India",
      "languages": ["English", "Tamil"],
      "expertise": ["Food", "History"],
      "yearsOfExperience": 5,
      "hourlyRate": 80000,
      "verificationStatus": "APPROVED",
      "avgRating": 4.8,
      "reviewCount": 42
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 87,
    "totalPages": 8
  }
}
```

**Notes:**
- Private fields (`email`, documents) are NOT included.
- Only `verificationStatus === "APPROVED"` guides get a verified badge.
- By default, only approved guides are returned unless caller is admin.

---

### 3.5 `GET /guides/:id`

**Access:** Public

**Purpose:** View one guide's public profile.

**Path param:** `id` — GuideProfile.id (not User.id)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 5,
    "name": "Ravi Kumar",
    "avatarUrl": "https://res.cloudinary.com/.../ravi.jpg",
    "bio": "Born and raised in Coimbatore...",
    "city": "Coimbatore",
    "country": "India",
    "languages": ["English", "Tamil"],
    "expertise": ["Food", "History"],
    "yearsOfExperience": 5,
    "hourlyRate": 80000,
    "serviceAreas": ["Coimbatore", "Ooty", "Mettupalayam"],
    "verificationStatus": "APPROVED",
    "avgRating": 4.8,
    "reviewCount": 42,
    "createdAt": "2026-01-15T10:00:00.000Z"
  }
}
```

**Errors:**

| Status | Code |
|--------|------|
| 404 | `GUIDE_NOT_FOUND` |

---

### 3.6 `GET /guides/:id/experiences`

**Access:** Public

**Purpose:** Get all active experiences listed by a guide.

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "title": "Coimbatore Street Food Walk",
      "category": "FOOD",
      "city": "Coimbatore",
      "durationMinutes": 180,
      "price": 80000,
      "maxGroupSize": 5,
      "images": ["https://res.cloudinary.com/.../img1.jpg"],
      "isActive": true
    }
  ]
}
```

Only `isActive: true` experiences are returned to public.

---

### 3.7 `POST /guide/verification`

**Access:** Authenticated, role `GUIDE`

**Purpose:** Submit verification documents for admin review.

**Request body:** `multipart/form-data`

```
govIdDocument: <file>
credentialsDocument: <file>   (optional)
notes: "Licensed tour guide since 2019"
```

**Constraints:**
- File types: `image/jpeg`, `image/png`, `application/pdf`
- Max size: 5 MB per file

**Response 201:**

```json
{
  "success": true,
  "message": "Verification submitted for review",
  "data": {
    "id": 3,
    "guideProfileId": 1,
    "status": "PENDING",
    "submittedAt": "2026-10-12T10:30:00.000Z"
  }
}
```

**Errors:**

| Status | Code |
|--------|------|
| 400 | `UNSUPPORTED_FILE_TYPE` |
| 400 | `FILE_TOO_LARGE` |
| 403 | `FORBIDDEN` |
| 409 | `VALIDATION_FAILED` (already pending or approved) |

---

### 3.8 `GET /guide/verification`

**Access:** Authenticated, role `GUIDE`

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 3,
    "guideProfileId": 1,
    "status": "PENDING",
    "notes": "Licensed tour guide since 2019",
    "rejectionReason": null,
    "submittedAt": "2026-10-12T10:30:00.000Z",
    "reviewedAt": null
  }
}
```

**Status values:** `NOT_SUBMITTED` \| `PENDING` \| `APPROVED` \| `REJECTED`

**Errors:**

| Status | Code |
|--------|------|
| 403 | `FORBIDDEN` |
| 404 | `VERIFICATION_NOT_FOUND` |

---

## 4. Module 3 — Experiences

An experience is a service offered by a guide (e.g., "Coimbatore Street Food Walk"). One guide can have many experiences.

### 4.1 `POST /experiences`

**Access:** Authenticated, role `GUIDE`, must have a profile

**Request body:** `multipart/form-data`

```
title: "Coimbatore Street Food Walk"
category: "FOOD"
city: "Coimbatore"
description: "Explore the best food streets..."
durationMinutes: 180
price: 80000
maxGroupSize: 5
languages: ["English", "Tamil"]
images: <file1>, <file2>   (up to 5 files)
```

**Constraints:**
- `title` — 5–120 chars
- `category` — must be one of enum values
- `durationMinutes` — 30–1440
- `price` — positive integer (paise)
- `maxGroupSize` — 1–20
- `languages` — min 1
- Images — max 5, each max 5 MB, types `jpeg/png/webp`

**Response 201:**

```json
{
  "success": true,
  "message": "Experience created",
  "data": {
    "id": 10,
    "guideProfileId": 1,
    "title": "Coimbatore Street Food Walk",
    "category": "FOOD",
    "city": "Coimbatore",
    "description": "Explore the best food streets...",
    "durationMinutes": 180,
    "price": 80000,
    "maxGroupSize": 5,
    "languages": ["English", "Tamil"],
    "images": [
      "https://res.cloudinary.com/.../img1.jpg",
      "https://res.cloudinary.com/.../img2.jpg"
    ],
    "isActive": true,
    "createdAt": "2026-10-12T10:30:00.000Z"
  }
}
```

**Errors:**

| Status | Code |
|--------|------|
| 400 | `VALIDATION_FAILED` |
| 400 | `UNSUPPORTED_FILE_TYPE` |
| 400 | `FILE_TOO_LARGE` |
| 403 | `FORBIDDEN` |

---

### 4.2 `GET /experiences/:id`

**Access:** Public (only active ones) / Owner (any status)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 10,
    "guideProfileId": 1,
    "guide": {
      "id": 1,
      "name": "Ravi Kumar",
      "avatarUrl": "https://.../ravi.jpg",
      "city": "Coimbatore",
      "verificationStatus": "APPROVED",
      "avgRating": 4.8
    },
    "title": "Coimbatore Street Food Walk",
    "category": "FOOD",
    "city": "Coimbatore",
    "description": "Explore the best food streets...",
    "durationMinutes": 180,
    "price": 80000,
    "maxGroupSize": 5,
    "languages": ["English", "Tamil"],
    "images": ["https://..."],
    "isActive": true,
    "createdAt": "2026-10-12T10:30:00.000Z"
  }
}
```

**Errors:**

| Status | Code |
|--------|------|
| 404 | `EXPERIENCE_NOT_FOUND` |

---

### 4.3 `PATCH /experiences/:id`

**Access:** Authenticated, role `GUIDE`, must own the experience

**Request body:** Any subset of the create fields, or:

```json
{ "isActive": false }
```

**Response 200:** Same shape as `GET /experiences/:id`.

**Errors:**

| Status | Code |
|--------|------|
| 400 | `VALIDATION_FAILED` |
| 403 | `FORBIDDEN` (not owner) |
| 404 | `EXPERIENCE_NOT_FOUND` |

---

### 4.4 `DELETE /experiences/:id`

**Access:** Authenticated, role `GUIDE`, must own the experience

**Purpose:** Soft-delete (archive) the experience. Existing bookings are preserved.

**Response 200:**

```json
{
  "success": true,
  "message": "Experience archived"
}
```

**Errors:**

| Status | Code |
|--------|------|
| 403 | `FORBIDDEN` |
| 404 | `EXPERIENCE_NOT_FOUND` |

---

### 4.5 `GET /guide/experiences`

**Access:** Authenticated, role `GUIDE`

**Purpose:** List the authenticated guide's own experiences (including inactive).

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "title": "Coimbatore Street Food Walk",
      "category": "FOOD",
      "city": "Coimbatore",
      "durationMinutes": 180,
      "price": 80000,
      "isActive": true,
      "bookingCount": 12,
      "createdAt": "2026-10-12T10:30:00.000Z"
    }
  ]
}
```

---

## 5. Module 4 — Search & Recommendations

### 5.1 `GET /experiences`

**Access:** Public

**Purpose:** Search / browse experiences.

**Query params (all optional):**

| Param | Type | Description |
|-------|------|-------------|
| `city` | string | Filter by city |
| `category` | enum | `FOOD` \| `HERITAGE` \| `SHOPPING` \| `CULTURE` \| `SIGHTSEEING` \| `NATURE` \| `OTHER` |
| `language` | string | Filter by offered language |
| `minPrice` | integer (paise) | |
| `maxPrice` | integer (paise) | |
| `minDuration` | integer (minutes) | |
| `maxDuration` | integer (minutes) | |
| `date` | ISO date `YYYY-MM-DD` | Only experiences whose guide has availability that day |
| `q` | string | Free-text on title/description |
| `page` | integer | Default `1` |
| `limit` | integer | Default `12`, max `50` |
| `sort` | string | `price_asc` \| `price_desc` \| `rating` \| `newest` |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "title": "Coimbatore Street Food Walk",
      "category": "FOOD",
      "city": "Coimbatore",
      "durationMinutes": 180,
      "price": 80000,
      "images": ["https://..."],
      "guide": {
        "id": 1,
        "name": "Ravi Kumar",
        "verificationStatus": "APPROVED",
        "avgRating": 4.8,
        "reviewCount": 42
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4
  }
}
```

---

### 5.2 `GET /recommendations/guides`

**Access:** Public

**Purpose:** Rank guides based on a tourist's stated preferences. This is the flagship "smart matching" endpoint.

**Query params:**

| Param | Required | Type | Description |
|-------|----------|------|-------------|
| `city` | Yes | string | Destination |
| `date` | No | ISO date | Travel date — used for hard availability filter |
| `language` | No | string | Preferred language |
| `category` | No | enum | Preferred experience category |
| `interests` | No | comma-list | e.g. `Food,History,Culture` |
| `maxPrice` | No | integer (paise) | Budget cap on hourly rate |
| `limit` | No | integer | Default `10`, max `30` |

**Example:**

```
GET /api/recommendations/guides?city=Coimbatore&date=2026-10-25&language=English&category=FOOD&interests=Food,History&maxPrice=150000&limit=10
```

**Algorithm (two stages):**

**Stage 1 — Hard filters (disqualify):**
- Guide's `serviceAreas` does not include `city`
- Guide's `verificationStatus !== "APPROVED"`
- If `date` provided: no availability slot on that date
- If `language` provided and marked mandatory by caller (future flag): guide doesn't speak it
- Guide has no active experience matching `category` (if provided)

**Stage 2 — Weighted ranking of the survivors:**

| Criterion | Weight | How it's scored |
|-----------|--------|-----------------|
| Interest match | 30% | (matched interests) / (requested interests) |
| Budget compatibility | 25% | 1 if `hourlyRate <= maxPrice`, scaled down linearly to 0 at 2× over budget |
| Language match | 20% | 1 if guide speaks it, else 0 |
| Rating | 15% | `avgRating / 5` (neutral 0.6 if `reviewCount === 0`) |
| Experience | 10% | `min(yearsOfExperience / 10, 1)` |

Final score = `Σ (weight × criterion_score)` × 100 → percentage with 1 decimal.

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "guideId": 1,
      "name": "Ravi Kumar",
      "avatarUrl": "https://.../ravi.jpg",
      "city": "Coimbatore",
      "languages": ["English", "Tamil"],
      "expertise": ["Food", "History"],
      "verificationStatus": "APPROVED",
      "avgRating": 4.8,
      "reviewCount": 42,
      "hourlyRate": 80000,
      "matchScore": 88.5,
      "reasons": [
        "Matches your interests: Food, History",
        "Supports your preferred language",
        "Fits your budget"
      ]
    }
  ]
}
```

**Notes:**
- If `interests` is omitted, its weight is redistributed across the others.
- If `maxPrice` is omitted, budget is not considered.
- Guides with no reviews are not penalized — they get a neutral rating score.
- Result is capped at `limit` entries.

**Errors:**

| Status | Code |
|--------|------|
| 400 | `VALIDATION_FAILED` (`city` missing) |

---

### 5.3 `POST /recommendations/preview`

**Access:** Public

**Purpose:** Same as `GET /recommendations/guides` but accepts preferences as a JSON body — useful for forms.

**Request body:**

```json
{
  "city": "Coimbatore",
  "date": "2026-10-25",
  "language": "English",
  "category": "FOOD",
  "interests": ["Food", "History"],
  "maxPrice": 150000,
  "limit": 10
}
```

**Response 200:** Identical to `GET /recommendations/guides`.

**Errors:**

| Status | Code |
|--------|------|
| 400 | `VALIDATION_FAILED` |

---

## End of Modules 1–4

Modules 5–9 (Bookings, Chat, Itineraries, Reviews, Admin) will be finalized before Week 4 of development and appended here.

**Change process:** Any change to this file requires:
1. A message in the team chat
2. Both developers acknowledging
3. A git commit with message `docs(api): <what changed>`