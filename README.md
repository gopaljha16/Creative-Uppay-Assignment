# Movie Ticket Reservation

A full-stack, mobile-first movie booking application built for the Creative Upaay Full Stack Development Assignment. The interface is constrained to the required 390px width and implements the complete journey from movie discovery to ticket cancellation.

## Features

### Level 1

- Now Showing and Coming Soon movie lists, theatre pricing, and bottom navigation
- Movie details with local artwork, formats, cast, rating, and release information
- Seven-day scheduling flow with theatre, format, screen, and time selection
- Programmatic A-M by 1-12 seat matrix with available, occupied, selected, and temporarily locked states
- Six-seat transaction limit enforced in both the UI and API
- Live ticket total plus booking fee summary
- Redux booking state persisted to `localStorage` across refreshes
- MongoDB-backed movies, showtimes, seat state, and completed bookings
- Digital ticket history with mock QR codes, transaction dates, and cancellation

### Level 2 / bonus work

- Clerk sign-up, verification, login, protected routes, and optional demo-account autofill
- Simulated card checkout with Luhn, expiry, CVV, success, and decline validation
- Five-minute seat locks to reduce conflicting selections across sessions
- MongoDB transactions for atomic seat allocation and booking creation
- Failed-payment rollback that releases temporary seat locks
- MongoDB as the final source of truth for confirmed reservations

Distributed Redis locking is not claimed in this submission. The current implementation uses database-backed temporary locks and transactional confirmation.

## Architecture and state

The React frontend stores the in-progress selection in one Redux slice: movie, date, theatre, format, showtime, seats, and booking fee. Middleware serializes that slice to `localStorage` after every action, allowing checkout to survive a refresh.

The Express API owns final prices and seat state. It recalculates totals from the stored showtime price, validates seat codes and limits, creates bookings inside a MongoDB transaction, and releases seats when a booking is cancelled or a simulated payment fails. Client-provided totals are never trusted.

## Local setup

Requirements: Node.js 20+, npm, a Clerk application, and MongoDB Atlas or another replica-set MongoDB deployment. Transactions do not work on a standalone MongoDB server.

1. Install dependencies:

   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

2. Create environment files from the committed templates:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Set `DATABASE_URL` in `backend/.env`. Set the Clerk publishable key and API URL in `frontend/.env`.

4. Seed the database and start the API:

   ```bash
   cd backend
   npm run seed
   npm start
   ```

5. In a second terminal, start the frontend:

   ```bash
   cd frontend
   npm run dev
   ```

The frontend defaults to `http://localhost:5173`; the API defaults to `http://localhost:3000`. API health is available at `/api/health`.

## Demo and payment testing

Create a real demo user in the configured Clerk dashboard, then set `VITE_DEMO_EMAIL` and `VITE_DEMO_PASSWORD` in the deployed frontend. When both exist, the login screen shows a one-click demo-account button.

- Successful card: `4242 4242 4242 4242`, any future `MM/YY`, CVV `123`
- Simulated decline: `4000 0000 0000 0002`, or use CVV `999`

No real payment information is stored or transmitted to a payment provider.

## Useful commands

```bash
cd frontend
npm run lint
npm run build

cd ../backend
npm run check
npm run seed
npm start
```

## API overview

- `GET /api/movies`
- `GET /api/movies/:id`
- `GET /api/showtimes?movieId=...&date=...`
- `GET /api/showtimes/:id`
- `POST /api/showtimes/lock`
- `POST /api/showtimes/release`
- `POST /api/bookings`
- `GET /api/bookings?userId=...`
- `POST /api/bookings/:id/cancel`

