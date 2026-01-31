@echo off
echo Starting Cloudflare Tunnel for Admin Dashboard (Port 8080)...
echo.
echo Look for the URL ending in .trycloudflare.com below!
echo.
cloudflared tunnel --url http://localhost:8080
pause
