# ShiftAware Testing Plan (Appendable)

Use this as a living checklist. Append new suites as features ship. Keep steps deterministic so multiple agents can execute consistently.

## Principles
- Deterministic: fixed data/inputs, clear expected outcomes.
- Isolated: prefer seeded dev DB; reset between suites if needed.
- Incremental: start with smoke, then feature suites, then regression.
- Observability: capture logs/responses for failures.

## Environments
- **Dev (local compose):** app http://localhost:43000, db localhost:45432.
- **Test data:** Starlight Meadow 2026 seed (30 aliases, 6 shifts).
- **Secrets:** `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` loaded via env; verify before tests.

## Tooling
- HTTP: `curl` or REST client.
- Browser/E2E: Playwright (when UI available).
- Scripts: `node scripts/check-env.js`, `node scripts/test-password.js <pw> <hash>` (if present).
- Logs: `docker compose logs -f app db`.

## Smoke Checklist (run before suites)
1) `docker compose ps` shows `app`, `db` healthy.  
2) `curl http://localhost:43000/api/health` returns `status: ok` (once implemented).  
3) `psql` to `postgresql://postgres:postgres@localhost:45432/appdb` succeeds.  
4) `node scripts/check-env.js` reports `ADMIN_PASSWORD_HASH` present (if script exists).  
5) `npm run lint` passes (if configured).

## Authentication Suite (current focus)
Goal: validate env-based auth (no hashing), cookie flow.

1) **Env presence**
   - Ensure `ADMIN_PASSWORD` is set (e.g., in `.env.local`).
   - Optional: echo via `node -e "console.log(!!process.env.ADMIN_PASSWORD)"` (do NOT log the value).
2) **Login request**
   - `curl -i -X POST http://localhost:43000/api/auth/login -H "Content-Type: application/json" -d '{"password":"<pw>"}'`
   - Expect `Set-Cookie: authenticated=true; HttpOnly; SameSite=Lax; Max-Age=3600` and HTTP 200.
3) **Protected route access**
   - With returned cookie: `curl -i http://localhost:43000/api/people -H "Cookie: authenticated=true"` → expect 200 (once API exists) or redirect for pages.
   - Without cookie → expect 401 (API) or redirect to `/login` (pages).
4) **Session timeout**
   - Confirm cookie `Max-Age=3600`; adjust to short TTL in env (if supported) and re-test expiry manually.
5) **Login redirect guard**
   - When authenticated, visiting `/login` should redirect to `/dashboard`.
6) **Logout (if implemented)**
   - `curl -i -X POST http://localhost:43000/api/auth/logout -H "Cookie: authenticated=true"` → expect cookie cleared.
7) **Common failure modes to capture**
   - Missing `ADMIN_PASSWORD` → login 500 with misconfig message.
   - Wrong password → 401.
   - Cookie not set (secure flag in http) → run over http in dev; ensure `secure` only in production.

## Feature Suites (add as features land)
- **Shifts & Preferences (FR-001/FR-002):** CRUD APIs, validation, UI flows.
- **Assignment Algorithm (FR-004):** constraints (core-only min shifts, gender hard balance), scoring transparency, audit logs.
- **Coverage/Swaps/PDF (FR-005/FR-006/FR-007/FR-009/FR-012):** views, exports, audit trails.

## Regression Checklist (run before release)
- Smoke + Auth suite.
- CRUD round-trip for people/shifts/preferences.
- Algorithm run produces assignments respecting constraints.
- Exports generate PDFs without PII.
- Protected routes reject unauthenticated requests.
- Basic perf sanity: key endpoints <500ms p95 on seed data.

## How to Append
- Add new suite sections at the bottom.
- Keep steps numbered with expected outcomes.
- Reference seeds/configs used; include sample payloads/curl.

