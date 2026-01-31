# MCP Server Demo Sequence

This document provides the exact step-by-step demo sequence for the VOID MCP Server.

## Prerequisites

1. MCP server running: `npm run dev`
2. Admin app running: `cd admin-app && npm run dev`
3. Database seeded: `npm run seed`

## Demo Sequence

### Step 1: Voice Agent Creates Ticket

```bash
# Login as voice agent
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"voice","password":"voicepass"}'

# Response: {"success":true,"data":{"token":"eyJhbG...","user":{...}}}

# Create ticket (use token from above)
curl -X POST http://localhost:3000/api/tickets \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "title": "Login button overlaps footer on mobile",
    "description": "iPhone 12, Safari - button hidden behind footer",
    "component": "Login",
    "priority": "HIGH",
    "user_context": {"device": "iPhone 12", "route": "/login"}
  }'

# Response: {"success":true,"data":{"ticket_id":"T-XXXXXXXX","status":"PENDING",...}}
```

### Step 2: Fix Agent Claims & Fixes

```bash
# Login as fix agent
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"fixagent","password":"fixpass"}'

# List pending tickets
curl http://localhost:3000/api/tickets \
  -H 'Authorization: Bearer FIX_AGENT_TOKEN'

# Claim ticket
curl -X POST http://localhost:3000/api/tickets/T-XXXXXXXX/claim \
  -H 'Authorization: Bearer FIX_AGENT_TOKEN'

# Submit fix
curl -X POST http://localhost:3000/api/tickets/T-XXXXXXXX/submit_fix \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer FIX_AGENT_TOKEN' \
  -d '{
    "summary": "Fixed z-index on login button",
    "files_modified": ["Login.css"],
    "diff": "diff --git...",
    "sandbox_preview_url": "https://xxx.trycloudflare.com",
    "test_results": {"status": "PASS", "logs": "All tests passed"}
  }'
```

### Step 3: Admin Approves

```bash
# Login as admin
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"adminpass"}'

# Approve fix
curl -X POST http://localhost:3000/api/tickets/T-XXXXXXXX/approve \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer ADMIN_TOKEN' \
  -d '{"approved_by": "admin", "note": "Looks good!"}'
```

## Using the Admin Dashboard

1. Open http://localhost:8080
2. Login as `admin` / `adminpass`
3. See real-time ticket updates via SSE
4. Click a ticket to view:
   - User context
   - Code diff (Monaco Editor)
   - Sandbox preview (iframe)
   - Test results
5. Approve or Reject with feedback

## Automated Demo

Run the full demo automatically:

```bash
chmod +x demo.sh
./demo.sh
```

This creates a ticket, claims it, submits a fix, and approves it.
