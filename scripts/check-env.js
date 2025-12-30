#!/usr/bin/env node
/**
 * Check if environment variables are loaded correctly
 */

require('dotenv').config({ path: '.env' });

console.log('\nEnvironment Variables Check:');
console.log('AUTH_PASSWORD_HASH exists:', !!process.env.AUTH_PASSWORD_HASH);
console.log('AUTH_PASSWORD_HASH length:', process.env.AUTH_PASSWORD_HASH?.length || 0);
console.log('AUTH_PASSWORD_HASH value:', process.env.AUTH_PASSWORD_HASH ? process.env.AUTH_PASSWORD_HASH.substring(0, 20) + '...' : 'NOT SET');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('');

