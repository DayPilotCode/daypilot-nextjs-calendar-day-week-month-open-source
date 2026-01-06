#!/usr/bin/env node
/**
 * OBSOLETE: This script is no longer used.
 * 
 * ShiftAware now uses simplified auth per plan:
 * - Plain ADMIN_PASSWORD env variable (no hashing)
 * - Direct string comparison
 * 
 * This script is kept for reference only and will be removed in a future cleanup.
 */

console.warn('\n⚠️  This script is OBSOLETE.');
console.warn('ShiftAware uses simplified auth: plain ADMIN_PASSWORD env variable.');
console.warn('No password hash verification needed.\n');
process.exit(1);
