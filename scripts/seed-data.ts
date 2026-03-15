/**
 * Seed script to create fake users and licenses from JSON data
 * Run with: npx ts-node scripts/seed-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface User {
  username: string;
  email: string;
  passwordHash: string;
  role: string;
}

interface License {
  licenseKey: string;
  status: string;
  userId: number;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

async function seedData() {
  console.log('🌱 Starting data seeding from JSON files...\n');
  console.log(`🔗 Using API URL: ${API_URL}\n`);

  try {
    // Read JSON files
    const usersPath = path.join(__dirname, '../src/SeedData/users.json');
    const licensesPath = path.join(__dirname, '../src/SeedData/licenses.json');

    if (!fs.existsSync(usersPath)) {
      console.error(`❌ Users file not found at ${usersPath}`);
      process.exit(1);
    }

    if (!fs.existsSync(licensesPath)) {
      console.error(`❌ Licenses file not found at ${licensesPath}`);
      process.exit(1);
    }

    const usersData: User[] = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    const licensesData: License[] = JSON.parse(fs.readFileSync(licensesPath, 'utf-8'));

    console.log(`📂 Loaded ${usersData.length} users from users.json`);
    console.log(`📂 Loaded ${licensesData.length} licenses from licenses.json\n`);

    // Create users
    console.log('👤 Creating users...');
    let successfulUsers = 0;

    for (const user of usersData) {
      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: user.username,
            email: user.email,
            password: user.passwordHash,
          }),
        });

        const responseText = await response.text();
        
        if (response.ok) {
          successfulUsers++;
          console.log(`  ✓ Created user: ${user.username} (${user.email})`);
        } else {
          try {
            const error = JSON.parse(responseText);
            console.log(`  ℹ ${user.username}: ${error.message || error.error || 'Unknown error'}`);
          } catch {
            console.log(`  ✗ ${user.username}: [${response.status}] ${responseText.substring(0, 100)}`);
          }
        }
      } catch (error: any) {
        console.log(`  ✗ ${user.username}: ${error.message || error}`);
      }
    }

    console.log(`\n✅ User creation complete. Created ${successfulUsers}/${usersData.length} users.\n`);

    // Create licenses
    console.log('📜 Creating licenses...');
    let successfulLicenses = 0;

    for (let i = 0; i < licensesData.length; i++) {
      const license = licensesData[i];
      try {
        const payload = {
          userId: license.userId,
          expiresAt: license.expiresAt,
        };

        if (i === 0) {
          console.log(`  📋 Sample payload: ${JSON.stringify(payload)}`);
        }

        const response = await fetch(`${API_URL}/licenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        });

        const responseText = await response.text();

        if (response.ok) {
          successfulLicenses++;
          console.log(`  ✓ Created license for user ${license.userId}`);
        } else {
          try {
            const error = JSON.parse(responseText);
            const errorMsg = error.message || error.error || error.details || JSON.stringify(error);
            if (successfulLicenses === 0 && i === 0) {
              // Only log detailed error for first failure
              console.log(`  ✗ User ${license.userId}: [${response.status}] ${errorMsg}`);
            } else {
              console.log(`  ℹ User ${license.userId}: ${errorMsg}`);
            }
          } catch {
            console.log(`  ✗ User ${license.userId}: [${response.status}] ${responseText.substring(0, 150)}`);
          }
        }
      } catch (error: any) {
        console.log(`  ✗ User ${license.userId}: ${error.message || error}`);
      }
    }

    console.log(`\n✅ License creation complete. Created ${successfulLicenses}/${licensesData.length} licenses.\n`);
    console.log('🎉 Data seeding finished!');
    console.log(`\n📊 Summary:`);
    console.log(`  Users: ${successfulUsers}/${usersData.length}`);
    console.log(`  Licenses: ${successfulLicenses}/${licensesData.length}`);

  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message || error);
    process.exit(1);
  }
}

// Run seeding
seedData();

