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

const adminHash = env.ADMIN_PASSWORD_HASH?.trim();
const sessionSecret = env.SESSION_SECRET?.trim();
const dbUrl = env.DATABASE_URL?.trim();

console.log('\nADMIN_PASSWORD_HASH:');
console.log('  exists:', !!adminHash);
console.log('  length:', adminHash?.length || 0);
console.log('  prefix:', adminHash ? adminHash.substring(0, 12) + '...' : 'NOT SET');
console.log('  valid bcrypt:', adminHash ? adminHash.startsWith('$2') && adminHash.length === 60 : false);

// Check if hash is quoted in file
if (fs.existsSync(envLocalPath)) {
  const fileContent = fs.readFileSync(envLocalPath, 'utf-8');
  const hashLine = fileContent.split('\n').find(line => line.trim().startsWith('ADMIN_PASSWORD_HASH='));
  if (hashLine) {
    const isQuoted = (hashLine.includes('ADMIN_PASSWORD_HASH="') || hashLine.includes("ADMIN_PASSWORD_HASH='"));
    console.log('  quoted in file:', isQuoted);
    if (!isQuoted && adminHash && adminHash.length < 60) {
      console.log('  ⚠ WARNING: Hash appears unquoted and may be truncated!');
      console.log('  Fix: Add quotes: ADMIN_PASSWORD_HASH="' + adminHash + '..."');
    }
  }
} else if (fs.existsSync(envPath)) {
  const fileContent = fs.readFileSync(envPath, 'utf-8');
  const hashLine = fileContent.split('\n').find(line => line.trim().startsWith('ADMIN_PASSWORD_HASH='));
  if (hashLine) {
    const isQuoted = (hashLine.includes('ADMIN_PASSWORD_HASH="') || hashLine.includes("ADMIN_PASSWORD_HASH='"));
    console.log('  quoted in file:', isQuoted);
    if (!isQuoted && adminHash && adminHash.length < 60) {
      console.log('  ⚠ WARNING: Hash appears unquoted and may be truncated!');
      console.log('  Fix: Add quotes: ADMIN_PASSWORD_HASH="' + adminHash + '..."');
    }
  }
}

console.log('\nSESSION_SECRET:');
console.log('  exists:', !!sessionSecret);
console.log('  length:', sessionSecret?.length || 0);
console.log('  prefix:', sessionSecret ? sessionSecret.substring(0, 8) + '...' : 'NOT SET');

console.log('\nDATABASE_URL:');
console.log('  exists:', !!dbUrl);
console.log('  value:', dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'NOT SET');

console.log('\nALLOW_INSECURE_DEV_LOGIN:', env.ALLOW_INSECURE_DEV_LOGIN || 'not set (default: false)');
console.log('');

