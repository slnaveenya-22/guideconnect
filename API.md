# GuideConnect API Contracts

**Version:** 1.0
**Base URL:** `http://localhost:5000/api`
**Last updated:** 2026-10-14
**Status:** Frozen — All 9 Modules

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Module 1 — Authentication](#2-module-1--authentication)
3. [Module 2 — Guide Profile](#3-module-2--guide-profile)
4. [Module 3 — Experiences](#4-module-3--experiences)
5. [Module 4 — Search & Recommendations](#5-module-4--search--recommendations)
6. [Module 5 — Availability & Bookings](#6-module-5--availability--bookings)
7. [Module 6 — Chat & Conversations](#7-module-6--chat--conversations)
8. [Module 7 — Itineraries](#8-module-7--itineraries)
9. [Module 8 — Reviews](#9-module-8--reviews)
10. [Module 9 — Admin](#10-module-9--admin)
11. [Socket.IO Events](#11-socketio-events)

---

## 1. Conventions

### 1.1 Response Envelope

**Success:**
```json
{
  "success": true,
  "message": "Optional human-readable message",
  "data": { }
}
```

**Error:**
```json
{
  "success": false,
  "message": "What went wrong",
  "code": "MACHINE_READABLE_CODE"
}
```

### 1.2 Authentication

- **Type:** JWT
- **Header:** `Authorization: Bearer <token>`
- **Storage (frontend):** `localStorage` key `gc_token`
- **Expiry:** 7 days
- **On 401:** Frontend clears token + redirects to `/login`

### 1.3 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK — successful GET, PATCH |
| 201 | Created — successful POST |
| 204 | No Content — successful DELETE |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (wrong role or ownership) |
| 404 | Resource not found |
| 409 | Conflict (duplicate, double-booking, slot taken) |
| 500 | Server error |

### 1.4 Data Types

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | Integer | `1` | Auto-increment |
| `createdAt` / `updatedAt` | ISO 8601 string | `"2026-10-14T10:30:00.000Z"` | UTC |
| `date` | ISO date | `"2026-10-25"` | No time |
| `time` | ISO time | `"09:00"` | 24-hour |
| `price` | Integer (paise) | `80000` = ₹800 | Never float |
| `rating` | Float (1 decimal) | `4.5` | Range 0–5 |
| `role` | Enum | `"TOURIST"` \| `"GUIDE"` \| `"ADMIN"` | Uppercase |
| `verificationStatus` | Enum | `"NOT_SUBMITTED"` \| `"PENDING"` \| `"APPROVED"` \| `"REJECTED"` | |
| `bookingStatus` | Enum | `"PENDING"` \| `"ACCEPTED"` \| `"REJECTED"` \| `"RESCHEDULE_REQUESTED"` \| `"CANCELLED"` \| `"COMPLETED"` \| `"EXPIRED"` | |
| `category` | Enum | `"FOOD"` \| `"HERITAGE"` \| `"SHOPPING"` \| `"CULTURE"` \| `"SIGHTSEEING"` \| `"NATURE"` \| `"OTHER"` | |

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
CONVERSATION_NOT_FOUND
ITINERARY_NOT_FOUND
REVIEW_NOT_FOUND
VERIFICATION_NOT_FOUND
REPORT_NOT_FOUND
FORBIDDEN
SLOT_UNAVAILABLE
INVALID_STATUS_TRANSITION
REVIEW_NOT_ELIGIBLE
FILE_TOO_LARGE
UNSUPPORTED_FILE_TYPE
NOT_FOUND
SERVER_ERROR
```

---

## 2. Module 1 — Authentication

### 2.1 `POST /auth/register`

**Access:** Public

**Request:**
```json
{
  "name": "Ananya Sharma",
  "email": "ananya@example.com",
  "password": "secret123",
  "role": "TOURIST"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": { "id": 1, "name": "Ananya Sharma", "email": "ananya@example.com", "role": "TOURIST" }
}
```

**Errors:** `400 VALIDATION_FAILED` · `409 EMAIL_ALREADY_EXISTS`

---

### 2.2 `POST /auth/login`

**Access:** Public

**Request:**
```json
{ "email": "ananya@example.com", "password": "secret123" }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "id": 1, "name": "Ananya Sharma", "email": "ananya@example.com", "role": "TOURIST" }
  }
}
```

**Errors:** `400 VALIDATION_FAILED` · `401 AUTH_INVALID_CREDENTIALS`

---

### 2.3 `GET /auth/me`

**Access:** Authenticated

**Response 200:**
```json
{ "success": true, "data": { "id": 1, "name": "Ananya Sharma", "email": "ananya@example.com", "role": "TOURIST" } }
```

**Errors:** `401 AUTH_TOKEN_MISSING` · `401 AUTH_TOKEN_EXPIRED`

---

### 2.4 `GET /health`

**Access:** Public

**Response 200:**
```json
{ "success": true, "message": "GuideConnect API is running" }
```

---

## 3. Module 2 — Guide Profile

### 3.1 `POST /guide/profile`

**Access:** Authenticated, role `GUIDE`

**Request:**
```json
{
  "bio": "Born and raised in Coimbatore. I love showing visitors the food streets.",
  "city": "Coimbatore",
  "country": "India",
  "languages": ["English", "Tamil"],
  "expertise": ["Food", "History"],
  "yearsOfExperience": 5,
  "hourlyRate": 80000,
  "serviceAreas": ["Coimbatore", "Ooty", "Mettupalayam"]
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Guide profile created",
  "data": {
    "id": 1,
    "userId": 5,
    "bio": "Born and raised in Coimbatore...",
    "city": "Coimbatore",
    "country": "India",
    "languages": ["English", "Tamil"],
    "expertise": ["Food", "History"],
    "yearsOfExperience": 5,
    "hourlyRate": 80000,
    "serviceAreas": ["Coimbatore", "Ooty", "Mettupalayam"],
    "avatarUrl": null,
    "verificationStatus": "NOT_SUBMITTED",
    "avgRating": 0,
    "reviewCount": 0,
    "createdAt": "2026-10-14T10:30:00.000Z",
    "updatedAt": "2026-10-14T10:30:00.000Z"
  }
}
```

**Errors:** `400 VALIDATION_FAILED` · `403 FORBIDDEN` · `409 VALIDATION_FAILED`

---

### 3.2 `GET /guide/profile`

**Access:** Authenticated, role `GUIDE`

**Response 200:** Same shape as `POST /guide/profile` `data`.

**Errors:** `403 FORBIDDEN` · `404 GUIDE_NOT_FOUND`

---

### 3.3 `PATCH /guide/profile`

**Access:** Authenticated, role `GUIDE`

**Request:** Any subset of create fields.

**Response 200:** Same as `GET /guide/profile`.

---

### 3.4 `GET /guides`

**Access:** Public

**Query params:** `city`, `language`, `expertise`, `minRating`, `maxPrice`, `verifiedOnly`, `q`, `page`, `limit`, `sort` (`rating` | `price_asc` | `price_desc` | `newest`)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 5,
      "name": "Ravi Kumar",
      "avatarUrl": "https://.../ravi.jpg",
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
  "pagination": { "page": 1, "limit": 12, "total": 87, "totalPages": 8 }
}
```

---

### 3.5 `GET /guides/:id`

**Access:** Public

**Response 200:** Same fields as list item + `serviceAreas` and `createdAt`.

**Errors:** `404 GUIDE_NOT_FOUND`

---

### 3.6 `GET /guides/:id/experiences`

**Access:** Public

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
      "images": ["https://.../img1.jpg"],
      "isActive": true
    }
  ]
}
```

---

### 3.7 `POST /guide/verification`

**Access:** Authenticated, role `GUIDE`

**Request:** `multipart/form-data`
```
govIdDocument: <file>
credentialsDocument: <file>   (optional)
notes: "Licensed tour guide since 2019"
```

**Response 201:**
```json
{
  "success": true,
  "message": "Verification submitted for review",
  "data": { "id": 3, "guideProfileId": 1, "status": "PENDING", "submittedAt": "2026-10-14T10:30:00.000Z" }
}
```

**Errors:** `400 UNSUPPORTED_FILE_TYPE` · `400 FILE_TOO_LARGE` · `403 FORBIDDEN` · `409 VALIDATION_FAILED`

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
    "submittedAt": "2026-10-14T10:30:00.000Z",
    "reviewedAt": null
  }
}
```

---

## 4. Module 3 — Experiences

### 4.1 `POST /experiences`

**Access:** Authenticated, role `GUIDE`

**Request:** `multipart/form-data`
```
title, category, city, description, durationMinutes, price, maxGroupSize,
languages (JSON array as string), images (up to 5 files)
```

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
    "images": ["https://..."],
    "isActive": true,
    "createdAt": "2026-10-14T10:30:00.000Z"
  }
}
```

---

### 4.2 `GET /experiences/:id`

**Access:** Public (active) / Owner (any)

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
      "avatarUrl": "https://...",
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
    "createdAt": "2026-10-14T10:30:00.000Z"
  }
}
```

---

### 4.3 `PATCH /experiences/:id`

**Access:** Authenticated, role `GUIDE`, owner

**Response 200:** Same as `GET /experiences/:id`.

---

### 4.4 `DELETE /experiences/:id`

**Access:** Authenticated, role `GUIDE`, owner

**Response 200:**
```json
{ "success": true, "message": "Experience archived" }
```

---

### 4.5 `GET /guide/experiences`

**Access:** Authenticated, role `GUIDE`

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
      "createdAt": "2026-10-14T10:30:00.000Z"
    }
  ]
}
```

---

## 5. Module 4 — Search & Recommendations

### 5.1 `GET /experiences`

**Access:** Public

**Query params:** `city`, `category`, `language`, `minPrice`, `maxPrice`, `minDuration`, `maxDuration`, `date`, `q`, `page`, `limit`, `sort`

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
  "pagination": { "page": 1, "limit": 12, "total": 45, "totalPages": 4 }
}
```

---

### 5.2 `GET /recommendations/guides`

**Access:** Public

**Query params:** `city` (**required**), `date`, `language`, `category`, `interests` (comma-list), `maxPrice`, `limit`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "guideId": 1,
      "name": "Ravi Kumar",
      "avatarUrl": "https://...",
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

**Algorithm:** Stage 1 hard filters (service area, verification, availability, category) → Stage 2 weighted rank (Interests 30%, Budget 25%, Language 20%, Rating 15%, Experience 10%).

**Errors:** `400 VALIDATION_FAILED`

---

### 5.3 `POST /recommendations/preview`

**Access:** Public

**Request:**
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

---

## 6. Module 5 — Availability & Bookings

### 6.1 `POST /availability`

**Access:** Authenticated, role `GUIDE`

**Request:**
```json
{ "date": "2026-10-25", "startTime": "09:00", "endTime": "12:00" }
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 20,
    "guideProfileId": 1,
    "date": "2026-10-25",
    "startTime": "09:00",
    "endTime": "12:00",
    "isBooked": false
  }
}
```

**Errors:** `400 VALIDATION_FAILED` · `403 FORBIDDEN` · `409 SLOT_UNAVAILABLE`

---

### 6.2 `GET /availability/mine`

**Access:** Authenticated, role `GUIDE`

**Query params:** `from` (default today), `to` (default +30 days)

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": 20, "date": "2026-10-25", "startTime": "09:00", "endTime": "12:00", "isBooked": false, "bookingId": null }
  ]
}
```

---

### 6.3 `PATCH /availability/:id`

**Access:** Authenticated, role `GUIDE`, owner

**Response 200:** Same as create.

**Errors:** `400 VALIDATION_FAILED` · `403 FORBIDDEN` · `404 NOT_FOUND` · `409 SLOT_UNAVAILABLE`

---

### 6.4 `DELETE /availability/:id`

**Access:** Authenticated, role `GUIDE`, owner

**Response 204:** No content.

**Errors:** `403 FORBIDDEN` · `404 NOT_FOUND` · `409 INVALID_STATUS_TRANSITION`

---

### 6.5 `GET /availability/guides/:guideId`

**Access:** Public

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "date": "2026-10-25", "startTime": "09:00", "endTime": "12:00", "isBooked": false }
  ]
}
```

---

### 6.6 `POST /bookings`

**Access:** Authenticated, role `TOURIST`

**Request:**
```json
{
  "experienceId": 10,
  "availabilityId": 20,
  "groupSize": 3,
  "preferredLanguage": "English",
  "interests": ["Food", "History"],
  "message": "Hi! I'd like a 3-hour food walk on the 25th.",
  "proposedPrice": 70000
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Booking request submitted",
  "data": {
    "id": 101,
    "status": "PENDING",
    "touristId": 1,
    "guideProfileId": 1,
    "experienceId": 10,
    "availabilityId": 20,
    "date": "2026-10-25",
    "startTime": "09:00",
    "endTime": "12:00",
    "groupSize": 3,
    "preferredLanguage": "English",
    "interests": ["Food", "History"],
    "message": "Hi!...",
    "proposedPrice": 70000,
    "agreedPrice": null,
    "createdAt": "2026-10-14T10:30:00.000Z"
  }
}
```

**Errors:** `400 VALIDATION_FAILED` · `403 FORBIDDEN` · `404 EXPERIENCE_NOT_FOUND` · `409 SLOT_UNAVAILABLE`

---

### 6.7 `GET /bookings/my`

**Access:** Authenticated

**Query params:** `status` (optional)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "status": "PENDING",
      "date": "2026-10-25",
      "startTime": "09:00",
      "endTime": "12:00",
      "groupSize": 3,
      "agreedPrice": null,
      "proposedPrice": 70000,
      "experience": { "id": 10, "title": "Coimbatore Street Food Walk", "category": "FOOD" },
      "counterpart": { "id": 5, "name": "Ravi Kumar", "avatarUrl": "https://..." },
      "createdAt": "2026-10-14T10:30:00.000Z"
    }
  ]
}
```

---

### 6.8 `GET /bookings/:id`

**Access:** Authenticated, participants only

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "status": "PENDING",
    "tourist": { "id": 1, "name": "Ananya Sharma", "avatarUrl": null },
    "guide": { "id": 5, "name": "Ravi Kumar", "avatarUrl": "https://..." },
    "experience": { "id": 10, "title": "Coimbatore Street Food Walk", "category": "FOOD", "price": 80000 },
    "availability": { "id": 20, "date": "2026-10-25", "startTime": "09:00", "endTime": "12:00" },
    "groupSize": 3,
    "preferredLanguage": "English",
    "interests": ["Food", "History"],
    "message": "Hi!...",
    "proposedPrice": 70000,
    "agreedPrice": null,
    "statusHistory": [
      { "status": "PENDING", "at": "2026-10-14T10:30:00.000Z", "by": 1 }
    ],
    "conversationId": null,
    "itineraryId": null,
    "reviewId": null,
    "createdAt": "2026-10-14T10:30:00.000Z"
  }
}
```

**Errors:** `403 FORBIDDEN` · `404 BOOKING_NOT_FOUND`

---

### 6.9 `PATCH /bookings/:id/accept`

**Access:** Authenticated, assigned guide

**Request (optional):**
```json
{ "agreedPrice": 75000 }
```

**Response 200:**
```json
{
  "success": true,
  "message": "Booking accepted",
  "data": { "id": 101, "status": "ACCEPTED", "agreedPrice": 75000, "conversationId": 40, "itineraryId": 15 }
}
```

**Side effects:** availability `isBooked: true`; conversation created; empty itinerary created; tourist notified.

**Errors:** `403 FORBIDDEN` · `404 BOOKING_NOT_FOUND` · `409 INVALID_STATUS_TRANSITION` · `409 SLOT_UNAVAILABLE`

---

### 6.10 `PATCH /bookings/:id/reject`

**Access:** Authenticated, assigned guide

**Request:**
```json
{ "reason": "Already booked for another tour." }
```

**Response 200:**
```json
{ "success": true, "message": "Booking rejected", "data": { "id": 101, "status": "REJECTED" } }
```

---

### 6.11 `PATCH /bookings/:id/reschedule`

**Access:** Authenticated, either participant

**Request:**
```json
{
  "date": "2026-10-27",
  "startTime": "14:00",
  "endTime": "17:00",
  "note": "Would this work instead?"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Reschedule proposed",
  "data": {
    "id": 101,
    "status": "RESCHEDULE_REQUESTED",
    "proposedSchedule": { "date": "2026-10-27", "startTime": "14:00", "endTime": "17:00", "by": "TOURIST" }
  }
}
```

**Errors:** `400 VALIDATION_FAILED` · `403 FORBIDDEN` · `409 INVALID_STATUS_TRANSITION`

---

### 6.12 `PATCH /bookings/:id/reschedule/respond`

**Access:** Authenticated, other participant

**Request:**
```json
{ "accept": true }
```

**Response 200:**
```json
{ "success": true, "message": "Reschedule accepted", "data": { "id": 101, "status": "ACCEPTED" } }
```

If rejected → returns to previous state.

---

### 6.13 `PATCH /bookings/:id/cancel`

**Access:** Authenticated, either participant

**Request:**
```json
{ "reason": "Changed travel plans." }
```

**Response 200:**
```json
{ "success": true, "message": "Booking cancelled", "data": { "id": 101, "status": "CANCELLED" } }
```

**Side effects:** availability freed; conversation read-only; notification.

**Errors:** `409 INVALID_STATUS_TRANSITION`

---

### 6.14 `PATCH /bookings/:id/complete`

**Access:** Authenticated, assigned guide

**Response 200:**
```json
{ "success": true, "message": "Booking marked complete", "data": { "id": 101, "status": "COMPLETED" } }
```

**Side effects:** tourist becomes eligible to review; notification.

**Errors:** `409 INVALID_STATUS_TRANSITION`

---

## 7. Module 6 — Chat & Conversations

### 7.1 `GET /bookings/:bookingId/conversation`

**Access:** Authenticated, participants only

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 40,
    "bookingId": 101,
    "participants": [
      { "id": 1, "name": "Ananya Sharma", "avatarUrl": null },
      { "id": 5, "name": "Ravi Kumar", "avatarUrl": "https://..." }
    ],
    "lastMessage": {
      "id": 501,
      "content": "Let's meet at the main entrance.",
      "senderId": 5,
      "createdAt": "2026-10-14T10:32:00.000Z"
    },
    "unreadCount": 2,
    "createdAt": "2026-10-14T10:30:00.000Z"
  }
}
```

**Errors:** `403 FORBIDDEN` · `404 BOOKING_NOT_FOUND`

---

### 7.2 `GET /conversations/:id/messages`

**Access:** Authenticated, participants only

**Query params:** `page` (default 1), `limit` (default 30)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 501,
      "conversationId": 40,
      "senderId": 5,
      "senderName": "Ravi Kumar",
      "content": "Let's meet at the main entrance.",
      "isRead": true,
      "createdAt": "2026-10-14T10:32:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 30, "total": 87, "totalPages": 3 }
}
```

---

### 7.3 `POST /conversations/:id/messages`

**Access:** Authenticated, participants only

**Purpose:** REST fallback for sending messages (primary channel is Socket.IO).

**Request:**
```json
{ "content": "Perfect, see you there." }
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 502,
    "conversationId": 40,
    "senderId": 1,
    "content": "Perfect, see you there.",
    "isRead": false,
    "createdAt": "2026-10-14T10:33:00.000Z"
  }
}
```

**Errors:** `400 VALIDATION_FAILED` · `403 FORBIDDEN` · `404 CONVERSATION_NOT_FOUND`

---

### 7.4 `PATCH /conversations/:id/read`

**Access:** Authenticated, participants only

**Response 200:**
```json
{ "success": true, "message": "Messages marked as read" }
```

---

## 8. Module 7 — Itineraries

All itinerary endpoints are nested under `/bookings/:bookingId/itinerary`.

### 8.1 `GET /bookings/:bookingId/itinerary`

**Access:** Authenticated, participants only

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "bookingId": 101,
    "title": "Coimbatore Food Walk — Oct 25",
    "notes": "Wear comfortable shoes.",
    "items": [
      {
        "id": 201,
        "order": 1,
        "title": "Breakfast at Annapoorna",
        "description": "Famous for idli and filter coffee.",
        "startTime": "09:00",
        "endTime": "10:00",
        "locationName": "Annapoorna, DB Road, Coimbatore",
        "latitude": 11.0168,
        "longitude": 76.9558,
        "notes": null
      }
    ],
    "suggestions": [
      {
        "id": 5,
        "title": "Add a stop at Brookefields Mall",
        "note": "It's on the way back.",
        "status": "PENDING",
        "createdAt": "2026-10-14T11:00:00.000Z"
      }
    ],
    "createdAt": "2026-10-14T10:30:00.000Z",
    "updatedAt": "2026-10-14T11:00:00.000Z"
  }
}
```

**Errors:** `403 FORBIDDEN` · `404 BOOKING_NOT_FOUND`

---

### 8.2 `POST /bookings/:bookingId/itinerary`

**Access:** Authenticated, assigned guide

**Purpose:** Create itinerary (usually auto-created when booking is accepted).

**Request:**
```json
{ "title": "Coimbatore Food Walk — Oct 25", "notes": "Wear comfortable shoes." }
```

**Response 201:** Same shape as `GET`.

---

### 8.3 `PATCH /bookings/:bookingId/itinerary`

**Access:** Authenticated, assigned guide

**Request:**
```json
{ "title": "Updated title", "notes": "Bring water." }
```

**Response 200:** Same shape as `GET`.

---

### 8.4 `POST /bookings/:bookingId/itinerary/items`

**Access:** Authenticated, assigned guide

**Request:**
```json
{
  "title": "Breakfast at Annapoorna",
  "description": "Famous for idli and filter coffee.",
  "startTime": "09:00",
  "endTime": "10:00",
  "locationName": "Annapoorna, DB Road",
  "latitude": 11.0168,
  "longitude": 76.9558,
  "notes": null
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 201,
    "order": 1,
    "title": "Breakfast at Annapoorna",
    "description": "Famous for idli and filter coffee.",
    "startTime": "09:00",
    "endTime": "10:00",
    "locationName": "Annapoorna, DB Road",
    "latitude": 11.0168,
    "longitude": 76.9558,
    "notes": null
  }
}
```

---

### 8.5 `PATCH /bookings/:bookingId/itinerary/items/:itemId`

**Access:** Authenticated, assigned guide

**Response 200:** Same as item object above.

---

### 8.6 `DELETE /bookings/:bookingId/itinerary/items/:itemId`

**Access:** Authenticated, assigned guide

**Response 204:** No content.

---

### 8.7 `PATCH /bookings/:bookingId/itinerary/items/reorder`

**Access:** Authenticated, assigned guide

**Request:**
```json
{ "order": [201, 203, 202] }
```

**Response 200:**
```json
{ "success": true, "message": "Itinerary reordered" }
```

---

### 8.8 `POST /bookings/:bookingId/itinerary/suggestions`

**Access:** Authenticated, tourist (participant)

**Request:**
```json
{
  "title": "Add a stop at Brookefields Mall",
  "note": "It's on the way back."
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "title": "Add a stop at Brookefields Mall",
    "note": "It's on the way back.",
    "status": "PENDING",
    "createdAt": "2026-10-14T11:00:00.000Z"
  }
}
```

---

### 8.9 `GET /bookings/:bookingId/itinerary/suggestions`

**Access:** Authenticated, participants only

**Response 200:** Array of suggestion objects.

---

### 8.10 `PATCH /bookings/:bookingId/itinerary/suggestions/:id`

**Access:** Authenticated, assigned guide

**Request:**
```json
{ "status": "ACCEPTED" }
```

Status values: `PENDING` | `ACCEPTED` | `REJECTED`

**Response 200:** Updated suggestion object.

---

## 9. Module 8 — Reviews

### 9.1 `POST /bookings/:bookingId/review`

**Access:** Authenticated, tourist of the booking

**Preconditions:** Booking status `COMPLETED`, no existing review.

**Request:**
```json
{
  "rating": 5,
  "communicationRating": 5,
  "knowledgeRating": 4,
  "comment": "Amazing food tour! Ravi knew every hidden gem."
}
```

**Constraints:**
- `rating` — 1–5
- `communicationRating` — 1–5 (optional)
- `knowledgeRating` — 1–5 (optional)
- `comment` — max 1000 chars

**Response 201:**
```json
{
  "success": true,
  "message": "Review submitted",
  "data": {
    "id": 30,
    "bookingId": 101,
    "guideProfileId": 1,
    "rating": 5,
    "communicationRating": 5,
    "knowledgeRating": 4,
    "comment": "Amazing food tour!...",
    "createdAt": "2026-10-14T12:00:00.000Z"
  }
}
```

**Side effects:** guide's `avgRating` and `reviewCount` recalculated.

**Errors:** `400 VALIDATION_FAILED` · `403 FORBIDDEN` · `409 REVIEW_NOT_ELIGIBLE`

---

### 9.2 `GET /guides/:guideId/reviews`

**Access:** Public

**Query params:** `page`, `limit` (default 10), `sort` (`newest` | `rating_desc`)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 30,
      "rating": 5,
      "communicationRating": 5,
      "knowledgeRating": 4,
      "comment": "Amazing food tour!...",
      "reviewer": { "id": 1, "name": "Ananya Sharma", "avatarUrl": null },
      "experienceTitle": "Coimbatore Street Food Walk",
      "createdAt": "2026-10-14T12:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

---

### 9.3 `PATCH /reviews/:id`

**Access:** Authenticated, review owner

**Request:**
```json
{ "rating": 4, "comment": "Updated review." }
```

**Response 200:** Updated review object.

---

### 9.4 `DELETE /reviews/:id`

**Access:** Authenticated, review owner

**Response 204:** No content.

---

## 10. Module 9 — Admin

All admin endpoints require `role === "ADMIN"`.

### 10.1 `GET /admin/verification-requests`

**Access:** Admin

**Query params:** `status` (`PENDING` | `APPROVED` | `REJECTED`), `page`, `limit`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "guideProfileId": 1,
      "guide": { "id": 5, "name": "Ravi Kumar", "email": "ravi@example.com" },
      "status": "PENDING",
      "notes": "Licensed tour guide since 2019",
      "govIdDocumentUrl": "https://...",
      "credentialsDocumentUrl": "https://...",
      "submittedAt": "2026-10-14T10:30:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 12, "total": 5, "totalPages": 1 }
}
```

---

### 10.2 `GET /admin/verification-requests/:id`

**Access:** Admin

**Response 200:** Full detail of a single request (same shape as list item).

---

### 10.3 `PATCH /admin/verification-requests/:id/approve`

**Access:** Admin

**Request (optional):**
```json
{ "notes": "Verified against govt records." }
```

**Response 200:**
```json
{
  "success": true,
  "message": "Guide approved",
  "data": {
    "id": 3,
    "status": "APPROVED",
    "reviewedAt": "2026-10-14T12:00:00.000Z",
    "reviewedBy": 1
  }
}
```

**Side effects:** guide's `verificationStatus` becomes `APPROVED`; verified badge visible; guide notified.

---

### 10.4 `PATCH /admin/verification-requests/:id/reject`

**Access:** Admin

**Request:**
```json
{ "rejectionReason": "Uploaded ID is not legible." }
```

**Response 200:**
```json
{
  "success": true,
  "message": "Verification rejected",
  "data": { "id": 3, "status": "REJECTED", "rejectionReason": "Uploaded ID is not legible." }
}
```

**Side effects:** guide notified; can resubmit after fixing.

---

### 10.5 `GET /admin/users`

**Access:** Admin

**Query params:** `role`, `q` (search name/email), `isActive`, `page`, `limit`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Ravi Kumar",
      "email": "ravi@example.com",
      "role": "GUIDE",
      "isActive": true,
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 12, "total": 156, "totalPages": 13 }
}
```

---

### 10.6 `PATCH /admin/users/:id/status`

**Access:** Admin

**Purpose:** Suspend or reactivate an account.

**Request:**
```json
{ "isActive": false, "reason": "Multiple reports of no-show." }
```

**Response 200:**
```json
{ "success": true, "message": "User suspended", "data": { "id": 5, "isActive": false } }
```

**Side effects:** if guide suspended → their experiences hidden; bookings cancelled.

---

### 10.7 `GET /admin/experiences`

**Access:** Admin

**Query params:** `isActive`, `q`, `page`, `limit`

**Response 200:** Paginated list of experiences (all statuses, all guides).

---

### 10.8 `PATCH /admin/experiences/:id/status`

**Access:** Admin

**Request:**
```json
{ "isActive": false, "reason": "Contains misleading photos." }
```

**Response 200:**
```json
{ "success": true, "message": "Experience hidden", "data": { "id": 10, "isActive": false } }
```

---

### 10.9 `GET /admin/reports`

**Access:** Admin

**Query params:** `status` (`OPEN` | `RESOLVED` | `DISMISSED`), `page`, `limit`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 7,
      "reporter": { "id": 1, "name": "Ananya Sharma" },
      "reportedUser": { "id": 5, "name": "Ravi Kumar" },
      "bookingId": 101,
      "reason": "Guide was 40 minutes late.",
      "status": "OPEN",
      "createdAt": "2026-10-14T12:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 12, "total": 3, "totalPages": 1 }
}
```

---

### 10.10 `PATCH /admin/reports/:id`

**Access:** Admin

**Request:**
```json
{ "status": "RESOLVED", "adminNote": "Warned the guide." }
```

Status values: `OPEN` | `RESOLVED` | `DISMISSED`

**Response 200:**
```json
{ "success": true, "data": { "id": 7, "status": "RESOLVED", "adminNote": "Warned the guide." } }
```

---

### 10.11 `GET /admin/analytics`

**Access:** Admin

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 156,
    "totalTourists": 120,
    "totalGuides": 35,
    "totalAdmins": 1,
    "totalBookings": 340,
    "bookingsByStatus": {
      "PENDING": 12,
      "ACCEPTED": 45,
      "COMPLETED": 260,
      "CANCELLED": 20,
      "REJECTED": 3
    },
    "pendingVerifications": 4,
    "openReports": 3,
    "avgPlatformRating": 4.6
  }
}
```

---

## 11. Socket.IO Events

**Connection:** Client connects with JWT in handshake auth:
```js
io('http://localhost:5000', { auth: { token: 'jwt...' } });
```

### Client → Server

| Event | Payload | Purpose |
|-------|---------|---------|
| `conversation:join` | `{ conversationId: 40 }` | Join a conversation room |
| `message:send` | `{ conversationId: 40, content: "Hi" }` | Send a message |
| `message:read` | `{ conversationId: 40 }` | Mark all as read |
| `typing:start` | `{ conversationId: 40 }` | User started typing |
| `typing:stop` | `{ conversationId: 40 }` | User stopped typing |

### Server → Client

| Event | Payload | Purpose |
|-------|---------|---------|
| `message:new` | `{ id, conversationId, senderId, content, createdAt }` | A new message arrived |
| `message:read` | `{ conversationId, readBy }` | Messages marked read |
| `typing:start` | `{ conversationId, userId }` | Someone is typing |
| `typing:stop` | `{ conversationId, userId }` | Someone stopped typing |
| `notification:new` | `{ type, title, body, linkTo }` | In-app notification |
| `booking:updated` | `{ bookingId, status }` | Booking status changed |

**Rules:**
- Every message is saved to MySQL **before** being emitted.
- Only authorized participants can join a conversation room.
- Disconnect cleans up the user from all rooms.

---

## End of Contract