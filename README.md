# 🏸 RallySphere

> **Play. Rally. Improve.**  
> An Integrated Badminton Court Booking, Player Management, Match Scheduling & Performance Analytics Platform.

---

## 1. Project Overview

**RallySphere** is a centralized sports-tech platform designed to eliminate friction in recreational and club badminton. It unites facility reservations, player coordination, match scoring, and data-driven performance analytics into a single high-performance web platform.

---

## 2. Research Motivation and Existing System Limitations

### The Problem in Existing Systems

In typical badminton club ecosystems, operations remain deeply fragmented:

1. **Manual & Asynchronous Reservations:** Facilities often accept court bookings via telephone calls, WhatsApp direct messages, or walk-ins. This leads to frequent double bookings, conflicting records, and administrative overhead.
2. **Player Coordination Friction:** Finding sparring partners of matching skill tiers (Beginner, Intermediate, Advanced, Professional) is chaotic and relies on word-of-mouth or uncalibrated chat groups.
3. **Loss of Match Data:** Scoring is handwritten or verbally tracked; historical rally data, set conversion rates, and stamina curves are immediately lost once players leave the court.
4. **Lack of Accessible Sports Analytics:** While elite national players have access to kinematic sensors and video analysis suites, recreational and competitive club players have had no access to algorithmic performance diagnostics.

### How RallySphere Solves These Bottlenecks

- **Concurrency-Safe Court Booking:** Database-level slot validation prevents double booking by checking real-time slot statuses and atomic transaction locks.
- **Calibrated Skill & Style Matchmaking:** Standardized BWF-inspired skill tiers (Beginner, Intermediate, Advanced, Professional) and tactical styles (Aggressive Attacker, Tactical Deceiver, Defensive Counter-Puncher, Fast-Paced Net Dominator, All-Rounder).
- **Automated Performance Indexing:** Longitudinal match set tracking with instant recalculation of player ratings after every recorded fixture.
- **RallySphere AI Coach:** Seamless integration with Google Gemini (`gemini-3.8-flash`) via the modern `@google/genai` TypeScript SDK with automated rule-based sports science fallback.

*Note: RallySphere is an engineering implementation addressing problems identified in sports technology research, not an IEEE-certified hardware system.*

---

## 3. Technology Stack

### Frontend
- **React.js 19** with **Vite 8**
- **TypeScript** for strict type safety
- **Tailwind CSS v4** with a modern sports-tech visual identity (Strava / Playo athletic SaaS design language)
- **React Router v7** for single-page routing
- **Lucide React** for icons
- **Canvas Confetti** for milestone celebrations

### Backend
- **Node.js** with **Express.js** REST API architecture
- **JWT (JSON Web Token)** authentication & session management
- **Bcrypt.js** password hashing
- **@google/genai SDK** server-side for Gemini AI Coach performance diagnostics

### Database & Persistence
- Normalized relational database schema with ACID atomic persistence to `./data/rallysphere_db.json`.
- Full entity relationships, foreign keys, unique constraints, and conflict prevention.

---

## 4. System Architecture

```
[ Web Client / React SPA ]
           │
           │  HTTPS / REST + Bearer JWT
           ▼
[ Express API Gateway / Backend Middleware ]
     ├── Auth & Role Guards (Player / Admin)
     ├── Court Discovery & Availability Engine (Anti-Double Booking)
     ├── Match Management & Scoring Engine
     ├── Performance Rating Recalculation Service
     ├── Notification Dispatcher
     └── RallySphere AI Coach Service (@google/genai SDK / Fallback)
           │
           ▼
[ Persistent Normalized Database Engine (ACID JSON) ]
```

---

## 5. Database Schema & Entities

The system defines 11 normalized database entities:

1. **User:** `id`, `email`, `passwordHash`, `role` (`PLAYER` | `ADMIN`), `createdAt`
2. **PlayerProfile:** `id`, `userId`, `name`, `avatar`, `bio`, `age`, `location`, `skillLevel`, `playingStyle`, `preferredPosition`, `matchesPlayed`, `matchesWon`, `matchesLost`, `winPercentage`, `gamesWon`, `gamesLost`, `performanceScore`, `currentStreak`, `bestStreak`
3. **Facility:** `id`, `name`, `description`, `address`, `city`, `imageUrl`, `phone`, `operatingHours`, `amenities`, `rating`, `reviewCount`, `priceRange`
4. **Court:** `id`, `facilityId`, `courtNumber`, `type` (`Indoor` | `Outdoor`), `surface` (`BWF Synthetic Mat` | `Wooden Parquet` | `Rubberized`), `pricePerHour`, `isActive`, `blockedSlots`
5. **Booking:** `id`, `bookingNumber`, `userId`, `facilityId`, `courtId`, `date`, `startTime`, `endTime`, `durationHours`, `totalAmount`, `status`, `paymentStatus`, `paymentMethod`, `transactionId`
6. **Match:** `id`, `title`, `format` (`SINGLES` | `DOUBLES`), `courtId`, `venueName`, `date`, `time`, `creatorId`, `status`, `team1PlayerIds`, `team2PlayerIds`, `scores` (`setNumber`, `team1Score`, `team2Score`), `winnerTeam`, `durationMinutes`, `notes`
7. **MatchInvitation:** `id`, `matchId`, `senderId`, `receiverId`, `status` (`PENDING` | `ACCEPTED` | `DECLINED`)
8. **Notification:** `id`, `userId`, `title`, `message`, `type`, `read`, `link`, `createdAt`
9. **Achievement:** `id`, `code`, `title`, `description`, `icon`, `category`
10. **PlayerAchievement:** `id`, `playerId`, `achievementId`, `unlockedAt`
11. **Review:** `id`, `facilityId`, `userId`, `userName`, `rating`, `comment`, `createdAt`

---

## 6. Performance Score Formula

RallySphere calculates a continuous player performance rating (0 to 100) using a multi-factor weighted equation:

$$\text{Performance Score} = (\text{Win Rate} \times 0.40) + (\text{Recent Form Factor} \times 0.25) + (\text{Match Consistency} \times 0.20) + (\text{Game Margin} \times 0.15)$$

- **Win Rate (40%):** Career competitive winning percentage.
- **Recent Form Factor (25%):** Win percentage over the player's last 5 fixtures.
- **Match Consistency (20%):** Volume stability factor based on participating fixtures.
- **Game Margin (15%):** Ratio of sets won versus sets lost across rubber matches.

---

## 7. REST API Documentation

### Authentication
- `POST /api/auth/register` – Register a new player or admin account.
- `POST /api/auth/login` – Authenticate with email and password; returns JWT token.
- `GET /api/auth/me` – Retrieve authenticated session identity and profile.
- `POST /api/auth/forgot-password` – Request password reset instructions.
- `POST /api/auth/logout` – Client logout.

### Courts & Facilities
- `GET /api/facilities` – List facilities with search, city, and amenity filters.
- `GET /api/facilities/:id` – Retrieve facility details, courts, and customer reviews.
- `POST /api/facilities` – Create a new facility (Admin only).
- `GET /api/courts` – List courts or filter by facility ID.
- `GET /api/courts/:id/availability?date=YYYY-MM-DD` – Live slot availability from 06:00 to 22:00.
- `POST /api/courts` – Add a new court to a facility (Admin only).
- `POST /api/courts/:id/block-slot` – Block a slot for maintenance (Admin only).

### Bookings
- `GET /api/bookings` – Retrieve bookings for authenticated user or all (Admin).
- `POST /api/bookings` – Reserve a court with anti-double booking validation and mock payment.
- `PUT /api/bookings/:id/cancel` – Cancel eligible reservation, trigger mock refund, and reopen slot.

### Matches & Scoring
- `GET /api/matches` – List user matches or all matches.
- `POST /api/matches` – Schedule a singles or doubles match challenge and invite players.
- `POST /api/matches/:id/result` – Record set scores (e.g. 21-18, 19-21, 21-16), determine winner, and automatically recalculate player ratings in the database.
- `GET /api/matches/invitations/me` – List incoming challenge invitations.
- `PUT /api/matches/invitations/:id` – Accept or decline match invitation.

### Analytics & AI Coach
- `GET /api/performance/:playerId` – Comprehensive performance metrics and calculation breakdown.
- `GET /api/performance/:playerId/coach` – RallySphere AI Coach diagnostic (Gemini API or fallback).

### Notifications & Admin
- `GET /api/notifications` – List notifications for authenticated user.
- `PUT /api/notifications/:id/read` – Mark single notification read.
- `PUT /api/notifications/read-all` – Mark all notifications read.
- `GET /api/admin/overview` – Admin dashboard metrics, 7-day bookings trend, and popular courts.

---

## 8. Demo Credentials & Quick Switcher

For evaluation, the application provides built-in pre-seeded accounts:

| Role | Email | Password |
|---|---|---|
| **Player (Alex Chen)** | `demo.player@rallysphere.com` | `password123` |
| **Facility Admin** | `demo.admin@rallysphere.com` | `password123` |

*Tip: Use the **"Switch to Player / Admin"** button in the top navigation bar to toggle between roles in one click.*

---

## 9. Installation & Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Steps

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file based on `.env.example`:
   ```bash
   GEMINI_API_KEY="your-gemini-api-key" # Optional (Rule-based fallback active if unset)
   PORT=3000
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:3000`.

4. **Production Build & Execution:**
   ```bash
   npm run build
   npm start
   ```

---

## 10. Limitations & Future Enhancements

- **Sensor Hardware Integration:** Future versions could connect to Bluetooth-enabled racket motion sensors (e.g., IMU sensors for racket head speed and smash angle).
- **Automated Video Camera Sync:** Synchronizing venue cameras to auto-record match sets using computer vision line tracking.
- **Production Payment Gateways:** Transition from mock sandbox payment records to live Stripe / UPI webhooks.
