#!/usr/bin/env node
/**
 * Test how Next.js/dotenv parses quoted values
 */

// Simulate what Next.js does - it uses dotenv internally
// But we can't import dotenv, so let's check what's actually in the file
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envLocalPath)) {
  console.log('.env.local not found');
  process.exit(1);
}

const content = fs.readFileSync(envLocalPath, 'utf-8');
const lines = content.split('\n');

console.log('=== Raw .env.local content ===');
const hashLine = lines.find(l => l.includes('ADMIN_PASSWORD_HASH'));
if (hashLine) {
  console.log('Hash line:', JSON.stringify(hashLine));
  console.log('Line length:', hashLine.length);
  
  // Parse manually
  const eqIndex = hashLine.indexOf('=');
  if (eqIndex !== -1) {
    const key = hashLine.substring(0, eqIndex).trim();
    let value = hashLine.substring(eqIndex + 1).trim();
    
    console.log('\n=== Parsed ===');
    console.log('Key:', key);
    console.log('Raw value:', JSON.stringify(value));
    console.log('Value length:', value.length);
    console.log('Starts with quote:', value.startsWith('"'));
    console.log('Ends with quote:', value.endsWith('"'));
    
    // Remove quotes if present (like dotenv does)
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      const unquoted = value.slice(1, -1);
      console.log('\n=== After removing quotes ===');
      console.log('Unquoted value:', JSON.stringify(unquoted));
      console.log('Unquoted length:', unquoted.length);
      console.log('Starts with $2a$:', unquoted.startsWith('$2a$'));
    }
  }
} else {
  console.log('ADMIN_PASSWORD_HASH line not found in .env.local');
}

