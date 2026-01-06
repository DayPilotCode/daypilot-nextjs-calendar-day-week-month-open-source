#!/usr/bin/env node
/**
 * Check if environment variables are loaded correctly
 * Reads .env.local or .env directly
 */

const fs = require('fs');
const path = require('path');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.substring(0, eqIndex).trim();
    let value = trimmed.substring(eqIndex + 1).trim();
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

const env = fs.existsSync(envLocalPath) 
  ? parseEnvFile(envLocalPath)
  : fs.existsSync(envPath)
  ? parseEnvFile(envPath)
  : {};

console.log('\nEnvironment Variables Check:');
console.log('Using:', fs.existsSync(envLocalPath) ? '.env.local' : fs.existsSync(envPath) ? '.env' : 'none found');

const adminPassword = env.ADMIN_PASSWORD?.trim();
const sessionTimeout = env.SESSION_TIMEOUT_MINUTES?.trim();
const dbUrl = env.DATABASE_URL?.trim();

console.log('\nADMIN_PASSWORD:');
console.log('  exists:', !!adminPassword);
console.log('  length:', adminPassword?.length || 0);
console.log('  value:', adminPassword ? '***' + adminPassword.substring(adminPassword.length - 2) : 'NOT SET');
if (!adminPassword) {
  console.log('  ⚠ WARNING: ADMIN_PASSWORD is required for authentication');
}

console.log('\nSESSION_TIMEOUT_MINUTES:');
console.log('  exists:', !!sessionTimeout);
console.log('  value:', sessionTimeout || '60 (default)');


console.log('\nDATABASE_URL:');
console.log('  exists:', !!dbUrl);
console.log('  value:', dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'NOT SET');

console.log('');

