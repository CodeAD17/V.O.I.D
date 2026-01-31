// ============================================
// Preview Routes - Cloudflare Tunnel Integration
// ============================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuid } from 'uuid';
import db from '../db/connection.js';
import { AuditService, SSEService } from '../services/index.js';
import { requireRole, sanitizeBody, validateRequired } from '../middleware/index.js';
import type { RegisterPreviewRequest, JWTPayload, APIResponse } from '../types/index.js';

interface RegisterPreviewBody { Body: RegisterPreviewRequest; }
interface PreviewParams { Params: { preview_id: string }; }

export async function previewRoutes(fastify: FastifyInstance): Promise<void> {

    /**
     * POST /api/previews
     * Register a preview URL for a ticket (fix_agent role)
     */
    fastify.post<RegisterPreviewBody>(
        '/',
        {
            preHandler: [
                requireRole('fix_agent'),
                sanitizeBody,
                validateRequired('ticket_id', 'preview_url')
            ]
        },
        async (request: FastifyRequest<RegisterPreviewBody>, reply: FastifyReply) => {
            const user = request.user as JWTPayload;
            const { ticket_id, preview_url, expires_at } = request.body;

            // Verify ticket exists
            const ticket = db.prepare('SELECT id, status FROM tickets WHERE id = ?').get(ticket_id) as { id: string; status: string } | undefined;

            if (!ticket) {
                return reply.code(404).send({
                    success: false,
                    error: 'Ticket not found'
                } as APIResponse);
            }

            // Validate preview URL format
            try {
                new URL(preview_url);
            } catch {
                return reply.code(400).send({
                    success: false,
                    error: 'Invalid preview URL format'
                } as APIResponse);
            }

            const id = uuid();
            const now = new Date().toISOString();

            // Insert preview record
            db.prepare(`
        INSERT INTO previews (id, ticket_id, preview_url, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, ticket_id, preview_url, expires_at || null, now);

            // Update ticket with preview URL
            db.prepare(`
        UPDATE tickets SET sandbox_preview_url = ?, updated_at = ? WHERE id = ?
      `).run(preview_url, now, ticket_id);

            AuditService.log(user.username, 'preview.registered', {
                preview_id: id,
                ticket_id,
                preview_url,
                expires_at
            });

            SSEService.broadcast('preview.registered', {
                preview_id: id,
                ticket_id,
                preview_url,
                registered_by: user.username
            });

            return reply.code(201).send({
                success: true,
                data: {
                    preview_id: id,
                    ticket_id,
                    preview_url,
                    created_at: now
                }
            } as APIResponse);
        }
    );

    /**
     * GET /api/previews/:preview_id
     * Get preview details
     */
    fastify.get<PreviewParams>(
        '/:preview_id',
        {
            preHandler: [requireRole('fix_agent', 'admin')]
        },
        async (request: FastifyRequest<PreviewParams>, reply: FastifyReply) => {
            const { preview_id } = request.params;

            const preview = db.prepare('SELECT * FROM previews WHERE id = ?').get(preview_id);

            if (!preview) {
                return reply.code(404).send({
                    success: false,
                    error: 'Preview not found'
                } as APIResponse);
            }

            return reply.send({
                success: true,
                data: { preview }
            } as APIResponse);
        }
    );

    /**
     * GET /api/previews/ticket/:ticket_id
     * Get all previews for a ticket
     */
    fastify.get<{ Params: { ticket_id: string } }>(
        '/ticket/:ticket_id',
        {
            preHandler: [requireRole('fix_agent', 'admin')]
        },
        async (request, reply) => {
            const { ticket_id } = request.params;

            const previews = db.prepare('SELECT * FROM previews WHERE ticket_id = ? ORDER BY created_at DESC').all(ticket_id);

            return reply.send({
                success: true,
                data: { previews }
            } as APIResponse);
        }
    );
}
