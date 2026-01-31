#!/bin/bash
# ============================================
# VOID Cloudflare Tunnel Preview Helper
# ============================================
# This script starts a cloudflared tunnel and registers
# the preview URL with the MCP server.
#
# Prerequisites:
# 1. Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
# 2. Authenticate: cloudflared tunnel login
#
# Usage:
#   ./start_preview.sh --ticket T-12345678 --port 3001
# ============================================

set -e

# Default values
TICKET_ID=""
LOCAL_PORT="3001"
MCP_URL="${MCP_URL:-http://localhost:3000}"
TOKEN=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --ticket|-t)
      TICKET_ID="$2"
      shift 2
      ;;
    --port|-p)
      LOCAL_PORT="$2"
      shift 2
      ;;
    --token)
      TOKEN="$2"
      shift 2
      ;;
    --mcp-url)
      MCP_URL="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate required args
if [ -z "$TICKET_ID" ]; then
  echo "Error: --ticket is required"
  echo "Usage: ./start_preview.sh --ticket T-12345678 [--port 3001] [--token JWT_TOKEN]"
  exit 1
fi

if [ -z "$TOKEN" ]; then
  echo "Error: --token is required (JWT token for fix_agent)"
  echo "You can get a token by logging in: curl -X POST $MCP_URL/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"fixagent\",\"password\":\"fixpass\"}'"
  exit 1
fi

echo "🚀 Starting Cloudflare Tunnel..."
echo "   Local port: $LOCAL_PORT"
echo "   Ticket ID: $TICKET_ID"
echo ""

# Start cloudflared in background and capture output
CLOUDFLARED_OUTPUT=$(mktemp)
cloudflared tunnel --url http://localhost:$LOCAL_PORT 2>&1 | tee "$CLOUDFLARED_OUTPUT" &
CLOUDFLARED_PID=$!

# Wait for the tunnel URL to appear
echo "⏳ Waiting for tunnel URL..."
PREVIEW_URL=""
for i in {1..30}; do
  PREVIEW_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' "$CLOUDFLARED_OUTPUT" | head -1)
  if [ -n "$PREVIEW_URL" ]; then
    break
  fi
  sleep 1
done

if [ -z "$PREVIEW_URL" ]; then
  echo "❌ Failed to get tunnel URL"
  kill $CLOUDFLARED_PID 2>/dev/null
  exit 1
fi

echo "✅ Tunnel URL: $PREVIEW_URL"
echo ""

# Register preview with MCP
echo "📡 Registering preview with MCP server..."
RESPONSE=$(curl -s -X POST "$MCP_URL/api/previews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"ticket_id\": \"$TICKET_ID\",
    \"preview_url\": \"$PREVIEW_URL\",
    \"expires_at\": \"$(date -u -d '+24 hours' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v+24H +%Y-%m-%dT%H:%M:%SZ)\"
  }")

echo "Response: $RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ Preview registered successfully!"
  echo ""
  echo "🔗 Preview URL: $PREVIEW_URL"
  echo "📋 Ticket: $TICKET_ID"
  echo ""
  echo "Press Ctrl+C to stop the tunnel"
  
  # Wait for cloudflared to exit
  wait $CLOUDFLARED_PID
else
  echo "❌ Failed to register preview"
  kill $CLOUDFLARED_PID 2>/dev/null
  exit 1
fi
