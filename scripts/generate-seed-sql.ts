#!/usr/bin/env node
/**
 * Generate SQL seed script from JSON data files
 * Run with: npx ts-node scripts/generate-seed-sql.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface User {
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: string;
  verifiedAt: string | null;
  updatedAt: string | null;
  lastLogin: string | null;
  blockedAt: string | null;
  status: string;
}

interface License {
  licenseKey: string;
  status: string;
  userId: number;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

function escapeSql(value: string | null): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  return `'${value.replace(/'/g, "''")}'`;
}

async function generateSqlFile() {
  const usersPath = path.join(__dirname, '../src/SeedData/users.json');
  const licensesPath = path.join(__dirname, '../src/SeedData/licenses.json');

  const users: User[] = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
  const licenses: License[] = JSON.parse(fs.readFileSync(licensesPath, 'utf-8'));

  let sql = `-- Auto-generated seed script for PostgreSQL
-- Generated from src/SeedData/users.json and src/SeedData/licenses.json
-- This script inserts ${users.length} users and ${licenses.length} licenses

-- Note: Add these lines at the beginning if you want to clear existing data:
-- DELETE FROM licenses;
-- DELETE FROM users;
-- ALTER SEQUENCE users_id_seq RESTART WITH 1;
-- ALTER SEQUENCE licenses_id_seq RESTART WITH 1;

-- Insert Users
INSERT INTO users (username, email, password_hash, role, status, created_at, verified_at, updated_at, last_login, blocked_at) VALUES\n`;

  // Generate user inserts with bcrypt-hashed passwords
  for (let index = 0; index < users.length; index++) {
    const user = users[index];
    // Hash password using bcrypt (bcrypt rounds: 10, which Go bcrypt.Cost defaults to)
    const hashedPassword = await bcrypt.hash(user.passwordHash, 10);
    const values = [
      escapeSql(user.username),
      escapeSql(user.email),
      escapeSql(hashedPassword),
      escapeSql(user.role),
      escapeSql(user.status),
      escapeSql(user.createdAt),
      user.verifiedAt ? escapeSql(user.verifiedAt) : 'NULL',
      user.updatedAt ? escapeSql(user.updatedAt) : 'NULL',
      user.lastLogin ? escapeSql(user.lastLogin) : 'NULL',
      user.blockedAt ? escapeSql(user.blockedAt) : 'NULL',
    ];
    sql += `(${values.join(', ')})`;
    if (index < users.length - 1) {
      sql += ',\n';
    }
  }

  sql += `\nON CONFLICT (email) DO NOTHING;

-- Insert Licenses
INSERT INTO licenses (license_key, user_id, status, created_at, expires_at, revoked_at, max_activations) VALUES\n`;

  // Generate license inserts
  licenses.forEach((license, index) => {
    const values = [
      escapeSql(license.licenseKey),
      license.userId,
      escapeSql(license.status),
      escapeSql(license.createdAt),
      escapeSql(license.expiresAt),
      license.revokedAt ? escapeSql(license.revokedAt) : 'NULL',
      1, // max_activations default
    ];
    sql += `(${values.join(', ')})`;
    if (index < licenses.length - 1) {
      sql += ',\n';
    }
  });

  sql += `\nON CONFLICT (license_key) DO NOTHING;

-- Print success message
SELECT 'Seed data inserted successfully!' as message;
SELECT COUNT(*) as users_count FROM users;
SELECT COUNT(*) as licenses_count FROM licenses;
`;

  // Write to file
  const outputPath = path.join(__dirname, 'seed-db.sql');
  fs.writeFileSync(outputPath, sql);
  console.log(`✓ SQL seed script generated: ${outputPath}`);
  console.log(`✓ Contains ${users.length} users and ${licenses.length} licenses`);
}


try {
  generateSqlFile().then(() => {
    console.log('✓ Seed script generated successfully');
    process.exit(0);
  }).catch((error) => {
    console.error('Error generating SQL seed script:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('Error generating SQL seed script:', error);
  process.exit(1);
}
