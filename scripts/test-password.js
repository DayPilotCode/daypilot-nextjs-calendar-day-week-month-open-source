#!/usr/bin/env node
/**
 * Test password verification
 * Usage: node scripts/test-password.js <password> <hash>
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];
const hash = process.argv[3];

if (!password || !hash) {
  console.error('Usage: node scripts/test-password.js <password> <hash>');
  process.exit(1);
}

console.log('\nTesting password verification:');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('Hash length:', hash.length);
console.log('\nVerifying...');

const isValid = bcrypt.compareSync(password, hash);
console.log('Result:', isValid ? '✓ VALID' : '✗ INVALID');

if (!isValid) {
  console.log('\nThe password does not match the hash.');
  console.log('Make sure you are using the correct password that was used to generate the hash.');
}

