// ============================================
// MCP Server Unit Tests
// ============================================

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';

// Test configuration
const TEST_PORT = 3099;
const BASE_URL = `http://localhost:${TEST_PORT}`;

describe('MCP Server API', () => {
    let server: FastifyInstance;
    let voiceToken: string;
    let fixToken: string;
    let adminToken: string;
    let testTicketId: string;

    beforeAll(async () => {
        // Note: In a real test environment, we would spin up the server here
        // For this demo, tests assume the server is running
        console.log('Tests assume server is running on port 3000');
    });

    afterAll(async () => {
        // Cleanup
    });

    // ============================================
    // Authentication Tests
    // ============================================
    describe('Authentication', () => {
        it('should login as voice agent', async () => {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'voice', password: 'voicepass' })
            });

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.token).toBeDefined();
            expect(data.data.user.role).toBe('voice_agent');
            voiceToken = data.data.token;
        });

        it('should login as fix agent', async () => {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'fixagent', password: 'fixpass' })
            });

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.user.role).toBe('fix_agent');
            fixToken = data.data.token;
        });

        it('should login as admin', async () => {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'admin', password: 'adminpass' })
            });

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.user.role).toBe('admin');
            adminToken = data.data.token;
        });

        it('should reject invalid credentials', async () => {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'invalid', password: 'wrong' })
            });

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(response.status).toBe(401);
        });
    });

    // ============================================
    // Ticket CRUD Tests
    // ============================================
    describe('Ticket Operations', () => {
        it('should create a ticket as voice agent', async () => {
            const response = await fetch('http://localhost:3000/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${voiceToken}`
                },
                body: JSON.stringify({
                    title: 'Test Ticket',
                    description: 'Test description',
                    component: 'TestComponent',
                    priority: 'HIGH',
                    user_context: { test: true }
                })
            });

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.ticket_id).toBeDefined();
            expect(data.data.status).toBe('PENDING');
            testTicketId = data.data.ticket_id;
        });

        it('should not allow fix agent to create tickets', async () => {
            const response = await fetch('http://localhost:3000/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${fixToken}`
                },
                body: JSON.stringify({
                    title: 'Unauthorized',
                    description: 'Should fail',
                    component: 'Test',
                    priority: 'LOW'
                })
            });

            expect(response.status).toBe(403);
        });

        it('should list tickets as fix agent', async () => {
            const response = await fetch('http://localhost:3000/api/tickets', {
                headers: { 'Authorization': `Bearer ${fixToken}` }
            });

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data.tickets)).toBe(true);
        });

        it('should get single ticket', async () => {
            const response = await fetch(`http://localhost:3000/api/tickets/${testTicketId}`, {
                headers: { 'Authorization': `Bearer ${fixToken}` }
            });

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.ticket.id).toBe(testTicketId);
        });
    });

    // ============================================
    // Ticket Workflow Tests
    // ============================================
    describe('Ticket Workflow', () => {
        it('should claim ticket as fix agent', async () => {
            const response = await fetch(`http://localhost:3000/api/tickets/${testTicketId}/claim`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${fixToken}` }
            });

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.status).toBe('IN_PROGRESS');
        });

        it('should submit fix as fix agent', async () => {
            const response = await fetch(`http://localhost:3000/api/tickets/${testTicketId}/submit_fix`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${fixToken}`
                },
                body: JSON.stringify({
                    summary: 'Fixed the issue',
                    files_modified: ['test.ts'],
                    diff: 'diff --git a/test.ts\n+fixed line',
                    test_results: { status: 'PASS' }
                })
            });

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.status).toBe('REVIEW_PENDING');
        });

        it('should approve fix as admin', async () => {
            const response = await fetch(`http://localhost:3000/api/tickets/${testTicketId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    approved_by: 'admin',
                    note: 'Test approval'
                })
            });

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.status).toBe('APPROVED_FOR_PROD');
        });

        it('should not allow fix agent to approve', async () => {
            // Create a new ticket for this test
            const createRes = await fetch('http://localhost:3000/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${voiceToken}`
                },
                body: JSON.stringify({
                    title: 'RBAC Test',
                    description: 'Testing RBAC',
                    component: 'Test',
                    priority: 'LOW'
                })
            });
            const createData = await createRes.json();
            const newTicketId = createData.data.ticket_id;

            // Try to approve as fix agent (should fail)
            const response = await fetch(`http://localhost:3000/api/tickets/${newTicketId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${fixToken}`
                },
                body: JSON.stringify({ approved_by: 'fixagent' })
            });

            expect(response.status).toBe(403);
        });
    });

    // ============================================
    // Security Tests
    // ============================================
    describe('Security', () => {
        it('should reject requests without auth token', async () => {
            const response = await fetch('http://localhost:3000/api/tickets');
            expect(response.status).toBe(401);
        });

        it('should reject invalid tokens', async () => {
            const response = await fetch('http://localhost:3000/api/tickets', {
                headers: { 'Authorization': 'Bearer invalid_token' }
            });
            expect(response.status).toBe(401);
        });

        it('should sanitize input', async () => {
            const response = await fetch('http://localhost:3000/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${voiceToken}`
                },
                body: JSON.stringify({
                    title: '<script>alert("xss")</script>Safe Title',
                    description: 'Test',
                    component: 'Test',
                    priority: 'LOW'
                })
            });

            const data = await response.json();
            expect(data.success).toBe(true);
            // The title should have script tags stripped

            // Fetch the ticket to verify
            const getRes = await fetch(`http://localhost:3000/api/tickets/${data.data.ticket_id}`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const ticketData = await getRes.json();
            expect(ticketData.data.ticket.title).not.toContain('<script>');
        });
    });

    // ============================================
    // Health Check
    // ============================================
    describe('Health Check', () => {
        it('should return healthy status', async () => {
            const response = await fetch('http://localhost:3000/health');
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.data.status).toBe('healthy');
        });
    });
});
