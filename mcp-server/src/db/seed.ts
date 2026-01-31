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
    console.log('🌱 Seeding database with demo users...');

    // Run migrations first
    runMigrations();

    // Demo users as specified in requirements
    const users = [
        { username: 'admin', password: 'adminpass', role: 'admin' },
        { username: 'fixagent', password: 'fixpass', role: 'fix_agent' },
        { username: 'voice', password: 'voicepass', role: 'voice_agent' },
    ];

    const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, username, password_hash, role)
    VALUES (?, ?, ?, ?)
  `);

    for (const user of users) {
        const id = uuid();
        insertUser.run(id, user.username, hashPassword(user.password), user.role);
        console.log(`  ✅ Created user: ${user.username} (${user.role})`);
    }

    console.log('✅ Database seeding completed');
}

// Run seed if this file is executed directly
if (process.argv[1]?.includes('seed')) {
    seedDatabase();
}
