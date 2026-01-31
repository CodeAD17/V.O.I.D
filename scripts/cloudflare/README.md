# Cloudflare Tunnel Integration for VOID

This directory contains helper scripts for integrating Cloudflare Tunnel with the VOID MCP server to provide sandbox preview URLs.

## Prerequisites

1. **Install cloudflared**
   
   - Windows: `winget install Cloudflare.cloudflared`
   - macOS: `brew install cloudflared`
   - Linux: Download from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

2. **Authenticate (optional, for named tunnels)**
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create void-demo
   ```

## Quick Start (No Account Required)

For quick demos, you can use cloudflared without authentication:

```bash
# Start your dev server (e.g., on port 3001)
npm run dev -- --port 3001

# In another terminal, start the tunnel
cloudflared tunnel --url http://localhost:3001
```

cloudflared will output a public URL like `https://random-words.trycloudflare.com`

## Using the Helper Script

The `start_preview.sh` script automates starting a tunnel and registering it with MCP:

```bash
# First, get a JWT token for fix_agent
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"fixagent","password":"fixpass"}' | jq -r '.data.token')

# Start tunnel and register preview
./start_preview.sh --ticket T-12345678 --port 3001 --token $TOKEN
```

## Manual Registration

If you prefer to start the tunnel manually, you can register the preview URL using curl:

```bash
# Start tunnel
cloudflared tunnel --url http://localhost:3001

# Copy the URL from output, then register it
curl -X POST http://localhost:3000/api/previews \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "ticket_id": "T-12345678",
    "preview_url": "https://your-tunnel-url.trycloudflare.com",
    "expires_at": "2024-01-25T00:00:00Z"
  }'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MCP_URL` | MCP server URL | `http://localhost:3000` |
| `CLOUDFLARED_TOKEN` | Cloudflare API token (for named tunnels) | - |
| `CLOUDFLARED_TUNNEL_NAME` | Named tunnel name | `void-demo` |

## Security Notes

- Preview URLs are temporary and should be treated as sandbox environments
- Never expose production credentials through preview URLs
- The `sandbox` attribute is set on preview iframes in the admin dashboard
- Preview URLs are stored in the `sandbox_preview_url` field and clearly marked

## Troubleshooting

**Tunnel doesn't start:**
- Check if cloudflared is installed: `cloudflared --version`
- Ensure the local port is accessible

**Preview not showing in admin:**
- Verify the ticket ID is correct
- Check that the JWT token has `fix_agent` role
- Look for errors in MCP server logs
