# Real-Time Poll Rooms - Implementation Notes

## Fairness / Anti-Abuse Mechanisms
This application implements two robust mechanisms to reduce repeat/abusive voting, ensuring poll integrity.

### 1. Mechanism 1: LocalStorage Based Voter ID
**Description:**
Upon visiting the app for the first time, a unique `voterId` (UUID) is generated and stored in the user's browser `LocalStorage`. This ID is included with every vote request.

**Prevention:**
This prevents users from simply refreshing the page to vote again. The server checks if a vote already exists for the given `Poll ID` + `Voter ID` combination.

**Limitation:**
A determined user can clear their browser storage or use incognito mode to bypass this check. This is why we combine it with the second mechanism.

### 2. Mechanism 2: IP Address Check
**Description:**
The server captures the voter's IP address (via request headers like `x-forwarded-for` or direct connection IP). This IP is stored alongside the vote in the database.

**Prevention:**
This prevents users from voting multiple times even if they clear their cookies or use different browsers on the same device/network. The server checks if a vote exists for the given `Poll ID` + `IP Address`.

**Limitation:**
- Users behind a shared NAT (e.g., office/school network) might be blocked if someone else on the same network voted first.
- Users can switch networks (e.g., WiFi to Mobile Data) to bypass this check.

## Real-Time Implementation
The "real-time" requirement is achieved using **Socket.IO**.
- When a user casts a vote via the REST API, the server emits a `newVote` event to the specific `poll-room`.
- All connected clients update their UI state (vote counts and percentages) instantly without needing to refresh.
- Optimistic UI updates are also supported for immediate feedback.

## Persistence
- All polls, options, and votes are persisted in a **SQLite database** using **Prisma ORM**.
- Data remains intact across server restarts and page refreshes.
- Shareable links (`/polls/[id]`) work indefinitely as long as the database is active.
