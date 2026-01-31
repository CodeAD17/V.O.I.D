// ============================================
// SSE Events Route
// ============================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SSEService } from '../services/index.js';
import { requireAuth } from '../middleware/index.js';
import type { JWTPayload } from '../types/index.js';

export async function eventsRoutes(fastify: FastifyInstance): Promise<void> {

    /**
     * GET /api/events
     * Server-Sent Events subscription endpoint
     * Clients connect here to receive real-time updates
     */
    fastify.get(
        '/',
        {
            preHandler: [requireAuth]
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JWTPayload;

            const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',');
            const requestOrigin = request.headers.origin || '';
            const allowOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];

            // Set SSE headers
            reply.raw.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': allowOrigin,
                'X-Accel-Buffering': 'no' // Disable nginx buffering
            });

            // Send initial connection confirmation
            reply.raw.write(`data: ${JSON.stringify({
                type: 'connected',
                payload: { user_id: user.id, username: user.username },
                timestamp: new Date().toISOString()
            })}\n\n`);

            // Register this connection
            SSEService.addConnection(user.id, user.role, user.username, reply);

            // Set up heartbeat to keep connection alive
            const heartbeatInterval = setInterval(() => {
                try {
                    reply.raw.write(`:heartbeat\n\n`);
                } catch {
                    clearInterval(heartbeatInterval);
                    SSEService.removeConnection(user.id);
                }
            }, 30000); // Every 30 seconds

            // Handle client disconnect
            request.raw.on('close', () => {
                clearInterval(heartbeatInterval);
                SSEService.removeConnection(user.id);
            });

            // Don't end the response - keep it open for SSE
            // The response will be ended when the client disconnects
        }
    );

    /**
     * GET /api/events/status
     * Get current SSE connection status
     */
    fastify.get(
        '/status',
        {
            preHandler: [requireAuth]
        },
        async (_request: FastifyRequest, reply: FastifyReply) => {
            return reply.send({
                success: true,
                data: {
                    active_connections: SSEService.getConnectionCount(),
                    connected_agents: SSEService.getConnectedAgents()
                }
            });
        }
    );
}
