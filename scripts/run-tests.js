#!/usr/bin/env node
/**
 * Comprehensive test suite for ShiftAware
 * Run with: node scripts/run-tests.js
 * Requires: dev server running on http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
let sessionCookie = null;

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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function httpRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const cookies = res.headers['set-cookie'] || [];
        resolve({ status: res.statusCode, headers: res.headers, body, cookies });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function parseUrl(url) {
  const u = new URL(url);
  return {
    hostname: u.hostname,
    port: u.port || (u.protocol === 'https:' ? 443 : 80),
    path: u.pathname + u.search,
  };
}

const results = {
  passed: [],
  failed: [],
  skipped: [],
};

function test(name, fn) {
  return async () => {
    try {
      await fn();
      results.passed.push(name);
      console.log(`✓ ${name}`);
    } catch (error) {
      results.failed.push({ name, error: error.message });
      console.log(`✗ ${name}: ${error.message}`);
    }
  };
}

function skip(name, reason) {
  results.skipped.push({ name, reason });
  console.log(`⊘ ${name} (skipped: ${reason})`);
}

async function runTests() {
  console.log('\n=== ShiftAware Test Suite ===\n');
  console.log('Base URL:', BASE_URL);
  console.log('');

  // Smoke Tests
  console.log('--- Smoke Tests ---');
  
  await test('Health endpoint returns 200', async () => {
    const url = parseUrl(`${BASE_URL}/api/health`);
    const res = await httpRequest({
      hostname: url.hostname,
      port: url.port,
      path: url.path,
      method: 'GET',
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = JSON.parse(res.body);
    if (data.status !== 'ok') throw new Error(`Expected status 'ok', got '${data.status}'`);
  })();

  await test('Health endpoint reports env status', async () => {
    const url = parseUrl(`${BASE_URL}/api/health`);
    const res = await httpRequest({
      hostname: url.hostname,
      port: url.port,
      path: url.path,
      method: 'GET',
    });
    const data = JSON.parse(res.body);
    if (data.missingEnv && data.missingEnv.length > 0 && process.env.NODE_ENV === 'production') {
      throw new Error(`Missing env vars in production: ${data.missingEnv.join(', ')}`);
    }
  })();

  // Authentication Suite
  console.log('\n--- Authentication Suite ---');

  await test('Login with correct password returns 200', async () => {
    const url = parseUrl(`${BASE_URL}/api/auth/login`);
    const res = await httpRequest({
      hostname: url.hostname,
      port: url.port,
      path: url.path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, JSON.stringify({ password: 'Admin123!' }));
    
    if (res.status !== 200) {
      const error = JSON.parse(res.body);
      throw new Error(`Expected 200, got ${res.status}: ${error.error || res.body}`);
    }
    
    const data = JSON.parse(res.body);
    if (!data.success) throw new Error('Login response missing success flag');
    
    // Extract session cookie
    const cookieHeader = res.cookies.find(c => c.startsWith('shiftaware_session='));
    if (!cookieHeader) throw new Error('No session cookie set');
    sessionCookie = cookieHeader.split(';')[0];
  })();

  await test('Login with wrong password returns 401', async () => {
    const url = parseUrl(`${BASE_URL}/api/auth/login`);
    const res = await httpRequest({
      hostname: url.hostname,
      port: url.port,
      path: url.path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, JSON.stringify({ password: 'wrongpassword' }));
    
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  })();

  await test('Login without password returns 400', async () => {
    const url = parseUrl(`${BASE_URL}/api/auth/login`);
    const res = await httpRequest({
      hostname: url.hostname,
      port: url.port,
      path: url.path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, JSON.stringify({}));
    
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  })();

  await test('Auth check returns authenticated with valid cookie', async () => {
    if (!sessionCookie) {
      // Re-login to get cookie
      const url = parseUrl(`${BASE_URL}/api/auth/login`);
      const res = await httpRequest({
        hostname: url.hostname,
        port: url.port,
        path: url.path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }, JSON.stringify({ password: 'Admin123!' }));
      const cookieHeader = res.cookies.find(c => c.startsWith('shiftaware_session='));
      sessionCookie = cookieHeader ? cookieHeader.split(';')[0] : null;
    }
    
    if (!sessionCookie) throw new Error('No session cookie available');
    
    const url = parseUrl(`${BASE_URL}/api/auth/check`);
    const res = await httpRequest({
      hostname: url.hostname,
      port: url.port,
      path: url.path,
      method: 'GET',
      headers: { 'Cookie': sessionCookie },
    });
    
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = JSON.parse(res.body);
    if (!data.authenticated) throw new Error('Not authenticated despite valid cookie');
  })();

  await test('Auth check returns 401 without cookie', async () => {
    const url = parseUrl(`${BASE_URL}/api/auth/check`);
    const res = await httpRequest({
      hostname: url.hostname,
      port: url.port,
      path: url.path,
      method: 'GET',
    });
    
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  })();

  await test('Logout clears session cookie', async () => {
    if (!sessionCookie) throw new Error('No session cookie available');
    
    const url = parseUrl(`${BASE_URL}/api/auth/logout`);
    const res = await httpRequest({
      hostname: url.hostname,
      port: url.port,
      path: url.path,
      method: 'POST',
      headers: { 'Cookie': sessionCookie },
    });
    
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    
    // Check that cookie is cleared (expires in past or max-age=0)
    const cookieHeader = res.cookies.find(c => c.includes('shiftaware_session'));
    if (cookieHeader && !cookieHeader.includes('Max-Age=0') && !cookieHeader.includes('expires=')) {
      throw new Error('Session cookie not cleared');
    }
  })();

  // Feature API Tests (Phase 1+ - not implemented yet)
  console.log('\n--- Feature API Tests (Phase 1+) ---');
  
  skip('GET /api/shifts', 'Not implemented yet (Phase 1)');
  skip('POST /api/shifts', 'Not implemented yet (Phase 1)');
  skip('GET /api/preferences', 'Not implemented yet (Phase 1)');
  skip('POST /api/preferences', 'Not implemented yet (Phase 1)');
  skip('POST /api/assignments/run', 'Not implemented yet (Phase 1)');
  skip('GET /api/assignments', 'Not implemented yet (Phase 1)');
  skip('POST /api/assignments/swap', 'Not implemented yet (Phase 3)');
  skip('GET /api/members', 'Not implemented yet (Phase 1)');
  skip('POST /api/members', 'Not implemented yet (Phase 1)');
  skip('GET /api/audit', 'Not implemented yet (Phase 3)');
  skip('POST /api/export/pdf', 'Not implemented yet (Phase 2)');

  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${results.passed.length}`);
  console.log(`Failed: ${results.failed.length}`);
  console.log(`Skipped: ${results.skipped.length}`);
  
  if (results.failed.length > 0) {
    console.log('\nFailed tests:');
    results.failed.forEach(({ name, error }) => {
      console.log(`  - ${name}: ${error}`);
    });
  }
  
  if (results.skipped.length > 0) {
    console.log('\nSkipped tests (Phase 1+ features):');
    results.skipped.forEach(({ name, reason }) => {
      console.log(`  - ${name}: ${reason}`);
    });
  }
  
  console.log('');
  process.exit(results.failed.length > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error('Test runner error:', error);
  process.exit(1);
});

