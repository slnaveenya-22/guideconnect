@"
# Project Decisions

## Technical
- Database: MySQL + Prisma
- Auth: JWT + bcrypt
- Frontend: Vite + React + Bootstrap
- Icons: Lucide React
- HTTP: Axios
- Real-time: Socket.IO (Phase 6)
- Uploads: Cloudinary (Phase 3)
- Maps: Leaflet (Phase 6)

## Product
- Unverified guides cannot receive bookings
- Pending requests do NOT hold slots
- Only ACCEPTED bookings reserve slots
- Guide edits itinerary, tourist suggests
- One review per COMPLETED booking
- Chat enabled after ACCEPTED
- India only for v1
"@ | Out-File -FilePath DECISIONS.md -Encoding utf8