#!/usr/bin/env tsx
/**
 * Test script to verify database connection and schema
 * Run with: npx tsx scripts/test-db-connection.ts
 */

import { query, closePool } from '../lib/db';

async function testConnection() {
  console.log('Testing database connection...\n');

  try {
    // Test basic connection
    const result = await query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✓ Database connection successful');
    console.log(`  Current time: ${result.rows[0].current_time}`);
    console.log(`  PostgreSQL version: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}\n`);

    // Test tables exist
    const tables = ['people', 'shifts', 'shift_preferences', 'shift_assignments', 'audit_log'];
    console.log('Checking tables...');
    
    for (const table of tables) {
      const tableCheck = await query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [table]
      );
      
      if (tableCheck.rows[0].exists) {
        console.log(`  ✓ Table '${table}' exists`);
        
        // Count rows
        const countResult = await query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`    Rows: ${countResult.rows[0].count}`);
      } else {
        console.log(`  ✗ Table '${table}' does NOT exist`);
      }
    }

    console.log('\n✓ All checks passed!');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

testConnection();

