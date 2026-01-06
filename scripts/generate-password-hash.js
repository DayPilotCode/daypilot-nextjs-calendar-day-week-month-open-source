#!/usr/bin/env node
/**
 * Generate a bcrypt hash for the password
 * Usage: node scripts/generate-password-hash.js <password>
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/generate-password-hash.js <password>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\nPassword hash generated:');
console.log(hash);
console.log('\nAdd this to your .env.local file (IMPORTANT: quotes are required):');
console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
console.log('\nNote: The quotes are required because bcrypt hashes start with $,');
console.log('      which dotenv interprets as variable expansion without quotes.\n');

