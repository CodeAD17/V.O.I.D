# VOID - MCP Control Plane

The **VOID** system is a comprehensive Model Context Protocol (MCP) implementation featuring a central server, an admin dashboard, and autonomous agents (Voice & Fix).

## 🚀 Quick Start

To launch the entire system:

1.  **Start the Backend (MCP Server)**
    ```bash
    cd mcp-server
    npm install
    # Seed the database first (if new)
    npx tsx src/db/demo_seed.ts
    # Run server
    npx tsx src/index.ts
    ```

2.  **Start the Admin Dashboard** (Frontend)
    ```bash
    cd admin-app
    npm install
    npm run dev
    ```
    > Access at: http://localhost:8080

3.  **Start the Voice Agent** (Frontend UI)
    ```bash
    cd mcp-voice-agent
    npm install
    npm run dev
    ```
    > Access at: http://localhost:5173

4.  **Start the Fix Agent** (Background Worker)
    ```bash
    cd fix-agent
    npm install
    npm start
    ```

---

## 🏗 Architecture

### 1. `mcp-server` (Port 3000)
- **Tech**: Node.js, Fastify, SQLite.
- **Role**: The core brain. Manages tickets, authentication (JWT), and real-time events (SSE).
- **Database**: Stores users, tickets, and audit logs.

### 2. `admin-app` (Port 8080)
- **Tech**: React, Vite, TailwindCSS.
- **Role**: The "Control Plane" for humans. Allows viewing ticket details, diffs, logs, and approving/rejecting agent fixes.
- **Connection**: Proxies `/api` requests to `localhost:3000`.

### 3. `fix-agent`
- **Tech**: Node.js, TypeScript.
- **Role**: An autonomous agent that listens to `ticket.created` events, "thinks" (simulated), claims the ticket, and submits a code fix.

### 4. `mcp-voice-agent`
- **Tech**: React (Mobile UI).
- **Role**: A mobile-first interface for reporting issues via voice. Uses Gemini Live API (simulated/integrated) to transcribe speech to text and POST tickets to the server.

---

## 🔐 Credentials

| Role | Username | Password | Access |
|------|----------|----------|--------|
| **Admin** | `admin` | `adminpass` | Full Dashboard Access |
| **Fix Agent** | `fixagent` | `fixpass` | API Access (Fix Submissions) |
| **Voice Agent** | `voice` | `voicepass` | API Access (Ticket Creation) |

---

## 🛠 Troubleshooting

- **404 Errors**: Ensure you have seeded the database (`npx tsx src/db/demo_seed.ts`).
- **Connection Refused**: Ensure `mcp-server` is running on port 3000.
- **Login Failed**: Verify you are using the correct credentials above.
# V.O.I.D  
