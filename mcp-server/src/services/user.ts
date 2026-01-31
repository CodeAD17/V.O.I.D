// ============================================
// User Service
// ============================================

import { createHash } from 'crypto';
import db from '../db/connection.js';
import type { User, UserRole } from '../types/index.js';

export class UserService {
    /**
     * Hash password using SHA256 (use bcrypt in production)
     */
    static hashPassword(password: string): string {
        return createHash('sha256').update(password).digest('hex');
    }

    /**
     * Verify password
     */
    static verifyPassword(password: string, hash: string): boolean {
        return this.hashPassword(password) === hash;
    }

    /**
     * Find user by username
     */
    static findByUsername(username: string): User | null {
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
        return user || null;
    }

    /**
     * Find user by ID
     */
    static findById(id: string): User | null {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
        return user || null;
    }

    /**
     * Authenticate user and return user object if valid
     */
    static authenticate(username: string, password: string): User | null {
        const user = this.findByUsername(username);
        if (!user) return null;

        if (!this.verifyPassword(password, user.password_hash)) {
            return null;
        }

        return user;
    }

    /**
     * Check if user has required role
     */
    static hasRole(user: User, roles: UserRole | UserRole[]): boolean {
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        return allowedRoles.includes(user.role);
    }
}
