# EditHire — Editor Hiring Platform

A full-stack platform connecting clients with professional video/photo editors. Built with React, Node.js/Express, MongoDB, JWT auth, and Socket.IO real-time chat.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, React Router v6, Axios    |
| Backend     | Node.js, Express 4                  |
| Database    | MongoDB + Mongoose                  |
| Auth        | JWT (jsonwebtoken + bcryptjs)       |
| Real-time   | Socket.IO                           |
| Styling     | Custom CSS with DM Sans font        |

---

## Folder Structure

```
editor-platform/
├── backend/
│   ├── config/
│   │   └── seed.js              # Dummy data seeder
│   ├── middleware/
│   │   └── auth.js              # JWT auth middleware
│   ├── models/
│   │   ├── User.js              # User schema (client/editor roles)
│   │   ├── EditorProfile.js     # Editor profile schema
│   │   ├── HiringRequest.js     # Hire request schema
│   │   ├── Review.js            # Review/rating schema
│   │   └── Conversation.js      # Chat messages schema
│   ├── routes/
│   │   ├── auth.js              # /signup, /login, /me
│   │   ├── editors.js           # /editors CRUD
│   │   ├── hire.js              # /hire CRUD
│   │   ├── review.js            # /review CRUD
│   │   └── messages.js          # /messages CRUD
│   ├── server.js                # Express app + Socket.IO
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── Navbar.js
    │   ├── context/
    │   │   └── AuthContext.js   # Global auth state
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Signup.js
    │   │   ├── BrowseEditors.js
    │   │   ├── EditorProfile.js
    │   │   ├── ClientDashboard.js
    │   │   ├── EditorDashboard.js
    │   │   └── Messages.js
    │   ├── utils/
    │   │   └── api.js           # Axios instance with JWT interceptor
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── package.json
    └── .env.example
```

---

## Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

---

## Setup Instructions

### 1. Clone & Install

```bash
# Clone the repo
git clone <your-repo-url>
cd editor-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend** — copy and edit:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/editor-platform
JWT_SECRET=change_this_to_a_long_random_secret_string
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Frontend** — copy and edit:
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- 3 client accounts
- 5 editor accounts with full profiles
- Sample hiring requests and reviews

**Demo credentials** (password for all: `password123`):

| Role   | Email               |
|--------|---------------------|
| Client | alex@client.com     |
| Client | mia@client.com      |
| Client | jordan@client.com   |
| Editor | sofia@editor.com    |
| Editor | marcus@editor.com   |
| Editor | elena@editor.com    |
| Editor | dev@editor.com      |
| Editor | zara@editor.com     |

### 4. Start the Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
# App opens at http://localhost:3000
```

---

## API Reference

### Auth Routes (`/api`)

| Method | Endpoint  | Auth | Description              |
|--------|-----------|------|--------------------------|
| POST   | /signup   | No   | Register new user        |
| POST   | /login    | No   | Login, returns JWT       |
| GET    | /me       | Yes  | Get current user profile |

**Signup body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123", "role": "client" }
```

**Login body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```

---

### Editor Routes (`/api/editors`)

| Method | Endpoint        | Auth   | Description              |
|--------|-----------------|--------|--------------------------|
| GET    | /               | No     | Browse all editors       |
| GET    | /:userId        | No     | Get editor by user ID    |
| GET    | /profile/me     | Editor | Get own profile          |
| PUT    | /profile        | Editor | Update own profile       |

**Query params for GET /:**
- `skill` — filter by skill (e.g. `video-editing`)
- `minPrice`, `maxPrice` — price range
- `minRating` — minimum average rating
- `search` — text search on name/bio
- `sort` — `rating`, `price-asc`, `price-desc`

---

### Hire Routes (`/api/hire`)

| Method | Endpoint          | Auth   | Description                      |
|--------|-------------------|--------|----------------------------------|
| POST   | /                 | Client | Send a hire request              |
| GET    | /                 | Yes    | Get requests for current user    |
| PATCH  | /:id/status       | Yes    | Accept/reject/complete/cancel    |

**POST body:**
```json
{
  "editorId": "...",
  "projectTitle": "YouTube Vlog Edit",
  "description": "Edit 2 hours of footage into 15 min",
  "budget": 400,
  "deadline": "2025-05-01",
  "skills": ["video-editing", "color-grading"]
}
```

**PATCH body:**
```json
{ "status": "accepted" }
```
- Editor can set: `accepted`, `rejected`
- Client can set: `completed`, `cancelled`

---

### Review Routes (`/api/review`)

| Method | Endpoint        | Auth   | Description              |
|--------|-----------------|--------|--------------------------|
| POST   | /               | Client | Submit a review          |
| GET    | /editor/:id     | No     | Get reviews for editor   |

**POST body:**
```json
{
  "editorId": "...",
  "hiringRequestId": "...",
  "rating": 5,
  "comment": "Excellent work!"
}
```

> Note: You can only review completed projects, and only once per project.

---

### Message Routes (`/api/messages`)

| Method | Endpoint    | Auth | Description                        |
|--------|-------------|------|------------------------------------|
| GET    | /           | Yes  | Get all conversations              |
| GET    | /:userId    | Yes  | Get/create conversation with user  |
| POST   | /:userId    | Yes  | Send a message to user             |

---

## Database Schema

### User
```
name, email, password (hashed), role (client|editor), avatar, createdAt
```

### EditorProfile
```
user (ref), bio, skills[], portfolio[], pricingType, price, currency,
availability, location, experience, software[], averageRating,
totalReviews, completedProjects, responseTime
```

### HiringRequest
```
client (ref), editor (ref), projectTitle, description, budget,
deadline, status (pending|accepted|rejected|completed|cancelled), skills[]
```

### Review
```
client (ref), editor (ref), hiringRequest (ref), rating (1-5), comment
```

### Conversation
```
participants (ref[]), messages[{ sender, receiver, content, read }], lastMessage
```

---

## Features Walkthrough

### Client Flow
1. Sign up as **Client**
2. Browse editors (filter by skill, price, rating)
3. View editor profile (portfolio, reviews, stats)
4. Click **Hire Now** → fill in project details → send request
5. View request status in Dashboard
6. Message editor in real-time chat
7. Once project is **Completed**, leave a star review

### Editor Flow
1. Sign up as **Editor** (profile auto-created)
2. Update profile with skills, portfolio, pricing
3. View incoming hire requests on Dashboard
4. **Accept** or **Decline** requests
5. Chat with client about project details
6. Mark projects as completed

---

## Socket.IO Events

| Event           | Direction         | Payload                        |
|-----------------|-------------------|--------------------------------|
| `user:join`     | Client → Server   | `userId`                       |
| `users:online`  | Server → All      | `[userId, ...]`                |
| `message:send`  | Client → Server   | `{ receiverId, content, ... }` |
| `message:receive` | Server → Client | Message object                 |

---

## Payments (Cashfree)

Payments run on [Cashfree Payment Gateway](https://www.cashfree.com/docs). Add these to `backend/.env`:

```env
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
CASHFREE_ENV=sandbox          # "production" when live
CLIENT_URL=http://localhost:3000   # used for the payment return_url
# optional
CASHFREE_API_VERSION=2025-01-01
CASHFREE_NOTIFY_URL=          # per-order webhook URL (otherwise the dashboard one is used)
```

**Webhook:** in the Cashfree dashboard (Developers → Webhooks) add
`https://<your-backend>/api/payment/webhook`. It is the safety net for customers who pay and
close the tab before the browser confirms. Requests are authenticated with Cashfree's HMAC
signature, and the order status is re-fetched from Cashfree before anything is fulfilled.

**Flow:** the server prices the order and creates it (`POST /api/payment/create-order`,
`POST /api/subscription/create-order`) → the browser opens Cashfree checkout with the returned
`paymentSessionId` → the browser calls `POST /api/payment/verify` with the `orderId` → the server
asks Cashfree for the real status, checks the amount, and fulfils the order exactly once
(the webhook and `/verify` share the same idempotent settlement). Orders are tracked in the
`CashfreeOrder` collection. Amounts are in rupees.

Cashfree requires a mobile number on every order; users are asked for it once at first checkout.

## Editor bank account & withdrawals

Editors add their bank account on the **Wallet** page (`GET/PUT/DELETE /api/bank`) and can only
withdraw once one is saved. The account number is stored **encrypted** (AES-256-GCM); the browser
only ever sees the last 4 digits. Add a long random `BANK_ENCRYPTION_KEY` to `backend/.env`
(it falls back to `JWT_SECRET`). Don't change the key later, or saved numbers can't be decrypted.

A withdrawal (`POST /api/payment/withdraw`) debits the wallet at once and creates a **pending**
`WithdrawalRequest` with a snapshot of the bank details. Payouts are manual for now. From `backend/`:

```bash
node scripts/withdrawals.js list                # pending requests with full bank details
node scripts/withdrawals.js paid <id> <utr>     # after you send the money
node scripts/withdrawals.js failed <id>         # refunds the amount to the editor's wallet
```

---

## Production Deployment

### Backend (Railway / Render / Heroku)
1. Set environment variables in dashboard
2. Use MongoDB Atlas for production DB
3. Change `CLIENT_URL` to your frontend domain

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL` to your backend URL
2. Set `REACT_APP_SOCKET_URL` to your backend URL
3. `npm run build` → deploy `build/` folder

---

## License
MIT
