# VOID MCP Server

The backend core of the VOID system.

## Features
- **Fastify**: High-performance Node.js framework.
- **SQLite**: Local database with `better-sqlite3`.
- **JWT Auth**: Secure role-based access control.
- **SSE**: Server-Sent Events for real-time updates.

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    Ensure `.env` exists:
    ```env
    PORT=3000
    JWT_SECRET=void-mcp-secret-change-this-in-production
    DB_PATH=./data/void.db
    ```

3.  **Seed Database**
    Populates SQLite with demo users and tickets.
    ```bash
    npx tsx src/db/demo_seed.ts
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    # OR directly
    npx tsx src/index.ts
    ```

## API Endpoints

- `POST /auth/login` - Get JWT
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket
- `GET /api/events` - SSE Stream
