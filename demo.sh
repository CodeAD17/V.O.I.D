#!/bin/bash
# ============================================
# VOID MCP Demo Script
# ============================================
# This script demonstrates the full flow:
# 1. Voice agent creates a ticket
# 2. Fix agent claims and submits a fix
# 3. Admin approves the fix
# ============================================

set -e

MCP_URL="${MCP_URL:-http://localhost:3000}"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              VOID MCP Server Demo                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if server is running
echo "🔍 Checking MCP server..."
HEALTH=$(curl -s "$MCP_URL/health" || echo '{"success":false}')
if ! echo "$HEALTH" | grep -q '"success":true'; then
  echo "❌ MCP server is not running at $MCP_URL"
  echo "   Start it with: cd mcp-server && npm run dev"
  exit 1
fi
echo "✅ Server is healthy"
echo ""

# ============================================
# Step 1: Login as voice agent and create ticket
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📞 Step 1: Voice Agent Creates Ticket"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "→ Logging in as voice agent..."
VOICE_RESPONSE=$(curl -s -X POST "$MCP_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"voice","password":"voicepass"}')
VOICE_TOKEN=$(echo "$VOICE_RESPONSE" | grep -oP '"token":"[^"]+' | cut -d'"' -f4)

if [ -z "$VOICE_TOKEN" ]; then
  echo "❌ Failed to login as voice agent"
  echo "Response: $VOICE_RESPONSE"
  exit 1
fi
echo "✅ Logged in as voice agent"

echo ""
echo "→ Creating ticket..."
TICKET_RESPONSE=$(curl -s -X POST "$MCP_URL/api/tickets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VOICE_TOKEN" \
  -d '{
    "title": "Login button overlaps footer on mobile",
    "description": "User reported that on iPhone 12 with Safari, the login button is partially hidden behind the footer. This happens on the /login page when the keyboard is open.",
    "component": "Login",
    "priority": "HIGH",
    "user_context": {
      "user_id": "U-DEMO-123",
      "route": "/login",
      "device": "iPhone 12",
      "browser": "Safari 17.0",
      "logs": ["Error: Button position calculation failed", "Warning: Viewport resize detected"]
    }
  }')

TICKET_ID=$(echo "$TICKET_RESPONSE" | grep -oP '"ticket_id":"[^"]+' | cut -d'"' -f4)

if [ -z "$TICKET_ID" ]; then
  echo "❌ Failed to create ticket"
  echo "Response: $TICKET_RESPONSE"
  exit 1
fi
echo "✅ Ticket created: $TICKET_ID"
echo ""

# ============================================
# Step 2: Fix agent claims and submits fix
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Step 2: Fix Agent Claims & Submits Fix"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "→ Logging in as fix agent..."
FIX_RESPONSE=$(curl -s -X POST "$MCP_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"fixagent","password":"fixpass"}')
FIX_TOKEN=$(echo "$FIX_RESPONSE" | grep -oP '"token":"[^"]+' | cut -d'"' -f4)

if [ -z "$FIX_TOKEN" ]; then
  echo "❌ Failed to login as fix agent"
  exit 1
fi
echo "✅ Logged in as fix agent"

echo ""
echo "→ Claiming ticket..."
CLAIM_RESPONSE=$(curl -s -X POST "$MCP_URL/api/tickets/$TICKET_ID/claim" \
  -H "Authorization: Bearer $FIX_TOKEN")
echo "✅ Ticket claimed"

echo ""
echo "→ Submitting fix..."
SUBMIT_RESPONSE=$(curl -s -X POST "$MCP_URL/api/tickets/$TICKET_ID/submit_fix" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FIX_TOKEN" \
  -d '{
    "summary": "Fixed z-index issue on login button and adjusted footer positioning",
    "files_modified": ["src/components/Login.css", "src/components/Footer.css"],
    "diff": "diff --git a/src/components/Login.css b/src/components/Login.css\n--- a/src/components/Login.css\n+++ b/src/components/Login.css\n@@ -45,6 +45,7 @@\n .login-button {\n   padding: 12px 24px;\n   border-radius: 8px;\n+  position: relative;\n+  z-index: 100;\n }\n\ndiff --git a/src/components/Footer.css b/src/components/Footer.css\n--- a/src/components/Footer.css\n+++ b/src/components/Footer.css\n@@ -10,6 +10,7 @@\n .footer {\n   position: fixed;\n   bottom: 0;\n+  z-index: 50;\n }",
    "sandbox_preview_url": "https://demo-preview.trycloudflare.com",
    "test_results": {
      "status": "PASS",
      "logs": "✓ Login button visible on mobile (iPhone 12 simulator)\n✓ Footer properly positioned\n✓ No visual regressions detected\n\nRan 3 tests, 3 passed"
    }
  }')

if echo "$SUBMIT_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Fix submitted for review"
else
  echo "⚠️  Fix submission response: $SUBMIT_RESPONSE"
fi
echo ""

# ============================================
# Step 3: Admin approves the fix
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Step 3: Admin Approves Fix"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "→ Logging in as admin..."
ADMIN_RESPONSE=$(curl -s -X POST "$MCP_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"adminpass"}')
ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | grep -oP '"token":"[^"]+' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Failed to login as admin"
  exit 1
fi
echo "✅ Logged in as admin"

echo ""
echo "→ Approving fix..."
APPROVE_RESPONSE=$(curl -s -X POST "$MCP_URL/api/tickets/$TICKET_ID/approve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "approved_by": "admin",
    "note": "Fix looks good. Z-index approach is correct for this scenario."
  }')

if echo "$APPROVE_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Fix approved for production!"
else
  echo "⚠️  Approval response: $APPROVE_RESPONSE"
fi
echo ""

# ============================================
# Verify final state
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Final State"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

FINAL_TICKET=$(curl -s "$MCP_URL/api/tickets/$TICKET_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Ticket: $TICKET_ID"
echo "Status: $(echo "$FINAL_TICKET" | grep -oP '"status":"[^"]+' | cut -d'"' -f4)"
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              Demo Complete! ✨                               ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Open http://localhost:8080 to view the admin dashboard      ║"
echo "║  Login as: admin / adminpass                                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
