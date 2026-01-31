// ============================================
// Audit Log Service
// ============================================

import { v4 as uuid } from 'uuid';
import db from '../db/connection.js';
import type { AuditLog } from '../types/index.js';

export class AuditService {
    /**
     * Log an action to the audit log
     */
    static log(actor: string, action: string, payload: Record<string, unknown> = {}): AuditLog {
        const id = uuid();
        const timestamp = new Date().toISOString();

        db.prepare(`
      INSERT INTO audit_logs (id, actor, action, payload, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, actor, action, JSON.stringify(payload), timestamp);

        return { id, actor, action, payload, timestamp };
    }

    /**
     * Get audit logs with optional filtering
     */
    static getLogs(options: {
        actor?: string;
        action?: string;
        limit?: number;
        offset?: number;
    } = {}): AuditLog[] {
        const { actor, action, limit = 100, offset = 0 } = options;

        let query = 'SELECT * FROM audit_logs WHERE 1=1';
        const params: unknown[] = [];

        if (actor) {
            query += ' AND actor = ?';
            params.push(actor);
        }

        if (action) {
            query += ' AND action LIKE ?';
            params.push(`%${action}%`);
        }

        query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const rows = db.prepare(query).all(...params) as Array<{
            id: string;
            actor: string;
            action: string;
            payload: string;
            timestamp: string;
        }>;

        return rows.map(row => ({
            ...row,
            payload: JSON.parse(row.payload)
        }));
    }
}
