#!/usr/bin/env node
/**
 * Debug script to test auth flow and show what server sees
 * Usage: node scripts/test-auth-debug.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function httpRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('=== Auth Debug Test ===\n');
  
  // Check health endpoint
  console.log('1. Health check:');
  try {
    const healthRes = await httpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET',
    });
    const health = JSON.parse(healthRes.body);
    console.log('   Status:', health.status);
    console.log('   Missing env:', health.missingEnv.length > 0 ? health.missingEnv.join(', ') : 'none');
    console.log('');
  } catch (error) {
    console.log('   ERROR:', error.message);
    console.log('   Make sure dev server is running: npm run dev\n');
    process.exit(1);
  }
  
  // Try login
  console.log('2. Login attempt with "Admin123!":');
  try {
    const loginRes = await httpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, JSON.stringify({ password: 'Admin123!' }));
    
    console.log('   Status:', loginRes.status);
    const loginData = JSON.parse(loginRes.body);
    console.log('   Response:', loginData);
    
    if (loginRes.status === 200) {
      const cookie = loginRes.headers['set-cookie']?.find(c => c.startsWith('shiftaware_session='));
      if (cookie) {
        console.log('   ✓ Session cookie received');
        console.log('   Cookie:', cookie.substring(0, 50) + '...');
      } else {
        console.log('   ⚠ No session cookie in response');
      }
    } else {
      console.log('   ✗ Login failed');
      console.log('   Check server console for "login attempt" log');
      console.log('   It should show hash prefix and length the server sees');
    }
    console.log('');
  } catch (error) {
    console.log('   ERROR:', error.message);
    console.log('');
  }
  
  console.log('Next steps:');
  console.log('1. Check dev server console for "login attempt" log output');
  console.log('2. Compare hash prefix/length with .env.local');
  console.log('3. If mismatch, restart dev server: npm run dev');
  console.log('4. Verify hash: node scripts/test-password.js "Admin123!" <hash>');
  console.log('');
}

main().catch(console.error);

