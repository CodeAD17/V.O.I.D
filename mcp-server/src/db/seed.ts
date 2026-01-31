// ============================================
// Database Seed Script - Demo Users
// ============================================

import { v4 as uuid } from 'uuid';
import { createHash } from 'crypto';
import db from './connection.js';
import { runMigrations } from './migrate.js';

// Simple password hashing (use bcrypt in production)
function hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
}

export function seedDatabase(): void {
    console.log('🌱 [Seed] Checking/Seeding database with demo users...');

    // Run migrations first
    runMigrations();

    // Demo users as specified in requirements
    const users = [
        { username: 'admin', password: 'adminpass', role: 'admin' },
        { username: 'fixagent', password: 'fixpass', role: 'fix_agent' },
        { username: 'voice', password: 'voicepass', role: 'voice_agent' },
    ];

    const checkUser = db.prepare('SELECT id FROM users WHERE username = ?');
    const insertUser = db.prepare(`
        INSERT INTO users (id, username, password_hash, role)
        VALUES (?, ?, ?, ?)
    `);

    for (const user of users) {
        const existing = checkUser.get(user.username);
        if (!existing) {
            const id = uuid();
            insertUser.run(id, user.username, hashPassword(user.password), user.role);
            console.log(`  ✅ Created user: ${user.username} (${user.role})`);
        } else {
            // console.log(`  ℹ️ User exists: ${user.username}`);
        }
    }

    console.log('✅ Database seeding completed');
}

// Run seed if this file is executed directly
if (process.argv[1]?.includes('seed')) {
    seedDatabase();
}
