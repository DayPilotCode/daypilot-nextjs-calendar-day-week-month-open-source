# Auth Simplification - Implementation Notes

**Date:** 2026-01-06  
**Status:** ✅ Complete

## Summary

Simplified authentication implementation to match `TECHNOLOGY_STACK.md` plan:
- **Plain `ADMIN_PASSWORD` env variable** (no hashing)
- **Direct string comparison** (low-risk scope per plan)
- **Simple `authenticated=true` cookie** (no signing/HMAC)
- **Configurable timeout** via `SESSION_TIMEOUT_MINUTES` (default 60 min)

## Changes Made

### Code Changes
1. **`lib/auth.ts`** - Completely rewritten:
   - Removed bcrypt hashing logic
   - Removed signed session cookie logic (HMAC/SHA256)
   - Simplified to plain password comparison and simple cookie
   - Functions: `verifyLogin()`, `createSession()`, `isAuthenticated()`, `destroySession()`

2. **`app/api/auth/login/route.ts`** - Updated:
   - Now uses `verifyLogin()` and `createSession()` from `lib/auth.ts`
   - Checks `ADMIN_PASSWORD` env variable

3. **`app/api/auth/check/route.ts`** - Already compatible (uses `isAuthenticated()`)

4. **`app/api/auth/logout/route.ts`** - Already compatible (uses `destroySession()`)

5. **`middleware.ts`** - Already correct (checks `authenticated=true` cookie)

6. **`app/api/health/route.ts`** - Updated:
   - Now checks for `ADMIN_PASSWORD` instead of `ADMIN_PASSWORD_HASH`
   - Removed `SESSION_SECRET` check (not needed for simplified auth)

### Dependency Cleanup
- Removed `bcryptjs` from `package.json` dependencies
- Removed `@types/bcryptjs` from `package.json` devDependencies
- Removed `generate-hash` script from `package.json`

### Script Cleanup
- **`scripts/generate-password-hash.js`** - Flagged as OBSOLETE (exits with warning)
- **`scripts/test-password.js`** - Flagged as OBSOLETE (exits with warning)
- **`scripts/test-password.ps1`** - Flagged as OBSOLETE (exits with warning)
- **`scripts/check-env.js`** - Updated to check `ADMIN_PASSWORD` instead of `ADMIN_PASSWORD_HASH`

### Documentation Updates
- **`README.md`** - Updated auth section to reflect simplified approach
- **This file** - Created to document the simplification

## Plan Document Inconsistencies (Need Review)

The following plan documents still reference the old hash-based approach and may need updates:

1. **`SYSTEM_ARCHITECTURE.md`** (lines 228, 345, 373-374):
   - Mentions "Hash password, compare with stored hash"
   - Mentions "Password hashing (bcrypt)"
   - Lists `ADMIN_PASSWORD_HASH` and `SESSION_SECRET` as env vars

2. **`FEATURE_REQUIREMENTS.md`** (lines 351, 354):
   - Mentions "Validate password hash"
   - Mentions "Compare password to hash"

3. **`DATABASE_SCHEMA.md`** (lines 267, 484-485, 495-496):
   - References `auth_password_hash` in SystemConfig
   - Lists `ADMIN_PASSWORD_HASH` and `SESSION_SECRET` in env examples

4. **`TESTING_PLAN.md`** (lines 14, 19, 26):
   - References `ADMIN_PASSWORD_HASH` and `SESSION_SECRET`
   - Mentions `test-password.js` script

5. **`COMPLIANCE_REVIEW.md`** (multiple lines):
   - References hash-based auth throughout
   - Mentions `generate-password-hash.js`

6. **`phase0-implementation.md`** (line 6):
   - Mentions "signed cookie auth (ADMIN_PASSWORD_HASH, SESSION_SECRET)"

**Note:** `TECHNOLOGY_STACK.md` line 85 correctly specifies plain `ADMIN_PASSWORD` and direct comparison, which is the authoritative source.

## Migration Notes

For existing deployments:
1. Change `.env.local` from `ADMIN_PASSWORD_HASH=...` to `ADMIN_PASSWORD=yourpassword`
2. Remove `SESSION_SECRET` (not needed for simplified auth)
3. Restart dev server
4. Old signed session cookies will be invalid; users will need to log in again

## Testing

After simplification:
- ✅ Login with correct password → sets `authenticated=true` cookie
- ✅ Login with wrong password → 401 error
- ✅ Protected routes check cookie → redirect to `/login` if missing
- ✅ `/api/auth/check` → returns auth status
- ✅ `/api/auth/logout` → clears cookie
- ✅ Health check → validates `ADMIN_PASSWORD` present

