
// Native fetch used
const BASE_URL = 'http://localhost:3000';

async function main() {
    // 1. Login as Voice Agent
    console.log('🎤 Logging in as Voice Agent...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'voice', password: 'voicepass' })
    });

    const loginData: any = await loginRes.json();
    if (!loginData.success) {
        console.error('Login failed:', loginData);
        return;
    }

    const token = loginData.data.token;
    console.log('✅ Authenticated.');

    // 2. Create Ticket
    console.log('🎫 Creating Test Ticket...');
    const ticketRes = await fetch(`${BASE_URL}/api/tickets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            title: "Auto-Generated Test Ticket",
            description: "This ticket was created automatically to test the Fix Agent integration.",
            component: "Backend API",
            priority: "MEDIUM"
        })
    });

    const ticketData: any = await ticketRes.json();
    if (ticketData.success) {
        console.log(`✅ Ticket Created: ${ticketData.data.id}`);
    } else {
        console.error('Failed to create ticket:', ticketData);
    }
}

main();
