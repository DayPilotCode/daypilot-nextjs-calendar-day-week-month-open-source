#!/usr/bin/env tsx
/**
 * Run database migration
 * Usage: npm run migrate
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { query, closePool } from '../lib/db';

async function runMigration() {
  console.log('Running database migration...\n');

  try {
    // Read migration file
    const migrationPath = join(process.cwd(), 'migrations', '001_initial_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Remove comments and BEGIN/COMMIT, then split by semicolons
    let cleanedSQL = migrationSQL
      .replace(/--.*$/gm, '') // Remove single-line comments
      .replace(/BEGIN;?\s*/gi, '')
      .replace(/COMMIT;?\s*/gi, '')
      .trim();

    // Split by semicolons, but be careful with multi-line statements
    const statements = cleanedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length > 10); // Filter out empty or very short strings

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length === 0) continue;

      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        await query(statement);
        console.log(`  ✓ Statement ${i + 1} executed successfully\n`);
      } catch (error: any) {
        // Some errors are expected (like "table already exists")
        if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
          console.log(`  ⚠ Statement ${i + 1} skipped (already exists)\n`);
        } else {
          console.error(`  ✗ Statement ${i + 1} failed:`, error.message);
          throw error;
        }
      }
    }

    console.log('✓ Migration completed successfully!');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

runMigration();

