// ============================================
// SSE Event Emitter Service
// ============================================

import type { FastifyReply } from 'fastify';
import type { SSEEvent, SSEEventType } from '../types/index.js';

// Store active SSE connections
interface ConnectionData {
    reply: FastifyReply;
    role: string;
    username: string;
}

const connections: Map<string, ConnectionData> = new Map();

export class SSEService {
    /**
     * Add a new SSE connection
     */
    static addConnection(userId: string, role: string, username: string, reply: FastifyReply): void {
        // Close existing connection if any
        const existing = connections.get(userId);
        if (existing) {
            try {
                existing.reply.raw.end();
            } catch {
                // Connection might already be closed
            }
        }
        connections.set(userId, { reply, role, username });
        console.log(`📡 SSE: User ${username} (${role}) connected (${connections.size} active)`);
    }

    /**
     * Remove a SSE connection
     */
    static removeConnection(userId: string): void {
        const conn = connections.get(userId);
        if (conn) {
            connections.delete(userId);
            console.log(`📡 SSE: User ${conn.username} disconnected (${connections.size} active)`);
        }
    }

    /**
     * Broadcast event to all connected clients
     */
    static broadcast(type: SSEEventType, payload: Record<string, unknown>): void {
        const event: SSEEvent = {
            type,
            payload,
            timestamp: new Date().toISOString()
        };

        const data = `data: ${JSON.stringify(event)}\n\n`;

        for (const [userId, conn] of connections) {
            try {
                conn.reply.raw.write(data);
            } catch (error) {
                console.error(`Failed to send SSE to ${userId}:`, error);
                this.removeConnection(userId);
            }
        }

        console.log(`📡 SSE: Broadcasted ${type} to ${connections.size} clients`);
    }

    /**
     * Send event to specific user
     */
    static sendToUser(userId: string, type: SSEEventType, payload: Record<string, unknown>): boolean {
        const conn = connections.get(userId);
        if (!conn) return false;

        const event: SSEEvent = {
            type,
            payload,
            timestamp: new Date().toISOString()
        };

        try {
            conn.reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
            return true;
        } catch (error) {
            console.error(`Failed to send SSE to ${userId}:`, error);
            this.removeConnection(userId);
            return false;
        }
    }

    /**
     * Get current connection count
     */
    static getConnectionCount(): number {
        return connections.size;
    }

    /**
     * Get connected agents breakdown
     */
    static getConnectedAgents() {
        return Array.from(connections.values()).map(c => ({
            username: c.username,
            role: c.role
        }));
    }
}
