# Login Troubleshooting - Hash Parsing Issue

## Problem
Login returns 401 "Invalid password" despite correct hash in `.env.local`.

## Root Cause
The `$` characters in bcrypt hashes (`$2a$10$...`) were being interpreted as variable expansion by Next.js's env parser, causing the hash to be truncated.

**Server log showed:**
```
hashPrefix: '.ZhP4ABHGIwc', hashLen: 44
```

This indicates the hash was being parsed starting from position 16, missing the first 16 characters (`$2a$10$GOSmzrVhw.`).

## Solution Applied
Quoted the hash value in `.env.local`:

**Before:**
```
ADMIN_PASSWORD_HASH=$2a$10$GOSmzrVhw.ZhP4ABHGIwc..MFo0TUEkMB0fZ2txAZx17SYttfxBaq
```

**After:**
```
ADMIN_PASSWORD_HASH="$2a$10$GOSmzrVhw.ZhP4ABHGIwc..MFo0TUEkMB0fZ2txAZx17SYttfxBaq"
```

## Next Steps
1. **Restart dev server:** Stop `npm run dev` and restart
2. **Test login:** Try logging in with `Admin123!`
3. **Verify:** Check server console - should now show `hashLen: 60` and `hashPrefix: '$2a$10$GOS'`

## Verification
Run these commands to verify:
```bash
# Check env file
node scripts/check-env.js

# Test password hash
node scripts/test-password.js "Admin123!" "$2a$10$GOSmzrVhw.ZhP4ABHGIwc..MFo0TUEkMB0fZ2txAZx17SYttfxBaq"

# Run test suite
node scripts/run-tests.js
```

## Prevention
Always quote bcrypt hashes in `.env` files:
- ✅ `ADMIN_PASSWORD_HASH="$2a$10$..."`
- ❌ `ADMIN_PASSWORD_HASH=$2a$10$...`

