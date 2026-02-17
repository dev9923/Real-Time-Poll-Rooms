# 🗳️ Real-Time Poll Rooms

A robust, real-time polling application built with **Next.js**, **Socket.IO**, and **Prisma**. Create polls, share links, and watch results update instantly as people vote.

> **Status**: Fully Functional  
> **Live Demo**: [https://real-time-poll-rooms-gamma.vercel.app/](https://real-time-poll-rooms-gamma.vercel.app/)  
> **Database**: Connected to **Neon (PostgreSQL)**  
> **Fairness**: Dual-Layer Anti-Abuse Protection  

---

## 🚀 Features (Success Criteria)

### 1. Poll Creation
- **Dynamic Form**: Create polls with a question and unlimited options (minimum 2).
- **Validation**: Strict client-side and server-side validation ensures data integrity.
- **Instant Generation**: Unique, shareable URL generated immediately upon creation.

### 2. Join by Link
- **Seamless Access**: Polls are accessible via unique URLs (e.g., `/polls/123`).
- **Share**: Integrated "Copy Link" button makes sharing easy.
- **Universal Links**: Share links persist indefinitely; data is stored permanently.

### 3. Real-Time Results
- **Live Updates**: Built with **Socket.IO**, results update instantly on all connected clients without manual refreshing.
- **Optimistic UI**: Immediate visual feedback for voters.
- **Connection Status**: Live indicator showing socket connection state.

## 🚀 Deployment (Critical Step)

This app uses a PostgreSQL database (Neon). You **MUST** set the environment variable on your hosting platform for it to work.

### Vercel / Netlify Setup
1.  Go to your project settings.
2.  Find the **Environment Variables** section.
3.  Add the following variable:
    *   **Key**: `DATABASE_URL`
    *   **Value**: `postgresql://neondb_owner:npg_BC4qEMlIn7ja@ep-divine-bird-aicuw9f5-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require`
4.  **Redeploy** your application.

Without this, the app will fail with `Internal Server Error` because it cannot connect to the database.

### 4. Fairness & Anti-Abuse
Implemented robust mechanisms to ensure poll integrity (See [SUBMISSION_NOTES.md](./SUBMISSION_NOTES.md) for full details):
- **LocalStorage Voter ID**: Prevents simple page refreshes from duplicating votes.
- **IP Address Tracking**: Prevents multiple votes from the same network source or different browsers.
- **Enforcement**: Server checks both ID and IP before accepting any vote.

### 5. Persistence
- **Database**: All data (Polls, Options, Votes) is stored in **SQLite** via **Prisma ORM**.
- **Reliability**: Polls and votes persist across server restarts and page refreshes.
- **History**: "My Polls" section tracks all created polls.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Real-Time Engine**: [Socket.IO](https://socket.io/) (Custom Server)
- **Database**: SQLite
- **ORM**: [Prisma](https://www.prisma.io/)
- **Language**: TypeScript
- **Styling**: CSS Variables & Custom Glassmorphism Design

---

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dev9923/Real-Time-Poll-Rooms.git
   cd Real-Time-Poll-Rooms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the Application**
   ```bash
   npm run dev
   ```
   *Note: This implementation uses a custom server (`server.ts`) running on port **3010** to integrate Socket.IO with Next.js.*

5. **Open the App**
   Visit `http://localhost:3010` to start using the app.

---

## 📂 Project Structure

```
├── app/
│   ├── api/            # API Routes (Vote handling, Poll creation)
│   ├── polls/          # Poll Pages (View Poll, My Polls)
│   ├── globals.css     # Global Styles (Glassmorphism, Variables)
│   └── page.tsx        # Home Page (Create Poll Form)
├── lib/
│   └── prisma.ts       # Prisma Client Singleton
├── prisma/
│   └── schema.prisma   # Database Schema (Poll, Option, Vote)
├── server.ts           # Custom Node Server (Socket.IO + Next.js)
└── public/             # Static Assets
```

---

## 🔒 Fairness Notes
Detailed explanation of the **Fairness/Anti-Abuse** controls and **Real-Time Architecture** can be found in the [SUBMISSION_NOTES.md](./SUBMISSION_NOTES.md) file.

## 🛡️ Edge Cases Handled

1.  **Duplicate Voting**: 
    -   *Scenario*: User tries to vote multiple times by refreshing or opening a new tab.
    -   *Solution*: Checks both LocalStorage ID (browser-based) and IP Address (network-based) before accepting vote.
2.  **Concurrency**: 
    -   *Scenario*: Two users vote for the same option at the exact same millisecond.
    -   *Solution*: Database transactions ensure atomic updates; polling mechanism fetches the latest "true" state.
3.  **Network Falters**: 
    -   *Scenario*: User loses connection while viewing a poll.
    -   *Solution*: The polling system automatically recovers and fetches the latest data when the connection restores.
4.  **Empty/Invalid Polls**: 
    -   *Scenario*: User tries to create a poll with no options or title.
    -   *Solution*: Strict validation on both Client (UI) and Server (API) prevents malformed data.

## 🚧 Known Limitations & Future Improvements

1.  **Polling vs WebSockets**: 
    -   *Limitation*: Currently uses 2-second polling for serverless compatibility (Vercel/Netlify).
    -   *Future*: Implement a dedicated WebSocket microservice (e.g., Pusher or separate Node.js server) for true sub-second real-time updates without polling overhead.
2.  **IP Anti-Abuse in NAT**: 
    -   *Limitation*: Users on the same WiFi (e.g., a university dorm) share an IP and might be blocked from voting.
    -   *Future*: Implement a session-based cookie or user authentication system to allow distinct votes from shared networks.
3.  **Strict Transitions**: 
    -   *Limitation*: No "Close Poll" feature yet.
    -   *Future*: Add admin controls to manually close voting or set an automatic expiration timer.