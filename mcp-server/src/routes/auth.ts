// ============================================
// Authentication Routes
// ============================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserService, AuditService } from '../services/index.js';
import { sanitizeBody, validateRequired } from '../middleware/index.js';
import type { LoginRequest, LoginResponse, APIResponse } from '../types/index.js';

interface LoginBody {
    Body: LoginRequest;
}

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
    /**
     * POST /auth/login
     * Authenticate user and return JWT token
     */
    fastify.post<LoginBody>(
        '/login',
        {
            preHandler: [sanitizeBody, validateRequired('username', 'password')]
        },
        async (request: FastifyRequest<LoginBody>, reply: FastifyReply) => {
            const { username, password } = request.body;

            const user = UserService.authenticate(username, password);

            if (!user) {
                AuditService.log('anonymous', 'login.failed', { username });
                return reply.code(401).send({
                    success: false,
                    error: 'Invalid username or password'
                } as APIResponse);
            }

            // Generate JWT token
            const token = fastify.jwt.sign({
                id: user.id,
                username: user.username,
                role: user.role
            });

            AuditService.log(user.username, 'login.success', { role: user.role });

            const response: APIResponse<LoginResponse> = {
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role
                    }
                }
            };

            return reply.send(response);
        }
    );

    /**
     * POST /auth/refresh
     * Refresh JWT token (optional endpoint)
     */
    fastify.post(
        '/refresh',
        {
            preHandler: [fastify.authenticate]
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user;

            if (!user) {
                return reply.code(401).send({
                    success: false,
                    error: 'Invalid token'
                } as APIResponse);
            }

            // Generate new token
            const token = fastify.jwt.sign({
                id: user.id,
                username: user.username,
                role: user.role
            });

            return reply.send({
                success: true,
                data: { token }
            } as APIResponse);
        }
    );

    /**
     * GET /auth/me
     * Get current user info
     */
    fastify.get(
        '/me',
        {
            preHandler: [fastify.authenticate]
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return reply.send({
                success: true,
                data: {
                    user: request.user
                }
            } as APIResponse);
        }
    );
}
