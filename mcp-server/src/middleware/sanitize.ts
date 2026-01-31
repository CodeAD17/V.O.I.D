// ============================================
// Input Sanitization Middleware
// ============================================

import sanitizeHtml from 'sanitize-html';
import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Sanitize HTML options - strip all tags
 */
const sanitizeOptions: sanitizeHtml.IOptions = {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard'
};

/**
 * Recursively sanitize all string values in an object
 */
function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
        return sanitizeHtml(value, sanitizeOptions);
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }
    if (value && typeof value === 'object') {
        const sanitized: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value)) {
            sanitized[key] = sanitizeValue(val);
        }
        return sanitized;
    }
    return value;
}

/**
 * Middleware to sanitize request body
 * Strips script tags and other potentially dangerous HTML from all string fields
 */
export async function sanitizeBody(
    request: FastifyRequest,
    _reply: FastifyReply
): Promise<void> {
    if (request.body && typeof request.body === 'object') {
        request.body = sanitizeValue(request.body);
    }
}

/**
 * Validate that required fields are present in request body
 */
export function validateRequired(...fields: string[]) {
    return async function (
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> {
        const body = request.body as Record<string, unknown> | undefined;

        if (!body) {
            return reply.code(400).send({
                success: false,
                error: 'Request body is required'
            });
        }

        const missing = fields.filter(field => !body[field]);

        if (missing.length > 0) {
            return reply.code(400).send({
                success: false,
                error: `Missing required fields: ${missing.join(', ')}`
            });
        }
    };
}
