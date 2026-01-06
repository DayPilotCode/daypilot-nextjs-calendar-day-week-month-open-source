# ShiftAware Compliance Review Log

Log of repository adherence vs. development plan. Append new entries per review. Use ISO timestamp (UTC).

## 2026-01-06T00:00:00Z
- Scope status: repo is DayPilot calendar demo; only basic single-password auth implemented. No shift preference, configuration, assignment algorithm, visualization tied to data, manual swaps, audit, coverage dashboard, PDF export, or config UI from FR-001..FR-012.
- Privacy: uses hardcoded real names in demo calendar; violates “no PII, aliases only”.
- Backend/API: only `/api/auth/*`; missing `/api/shifts`, `/api/preferences`, `/api/assignments`, `/api/members`, `/api/audit`, `/api/export`.
- Data layer: SQL migration exists but unused; no Prisma schema or runtime DB integration in UI/API.
- Deployment: docker-compose uses port 3005 and external network; plan expects port palette 43000/45432 with bundled Postgres service.
- Recommended next actions:
  - Stand up planned API + Prisma schema for people/shifts/preferences/assignments/audit; run migrations and wire UI.
  - Replace demo calendar with planned pages: preference entry, shift config, schedule views, coverage gaps, manual swaps, PDF export, alias handling.
  - Implement assignment engine with constraints/scoring/explanations; add audit logging for all mutations.
  - Enforce pseudonymization end-to-end; remove real names from seeded/demo data; add conversion table handling.
  - Align compose/Dockerfile to port palette and include Postgres service; add migrations in entrypoint.

## 2026-01-06T11:15:00Z
- Phase 0 scaffold added: Tailwind layout, Prisma schema + seed, signed cookie auth, health endpoint, docker-compose with app/db ports aligned to plan.
- Authentication hardening: middleware now validates signed cookies; login route surfaces misconfiguration when secrets/hashes absent.
- Remaining gaps vs plan: no shift preference UI/API, no shift config UI/API, no assignment algorithm/coverage dashboards/manual swaps/PDF export/audit UI; pseudonym-to-name conversion remains external; testing/monitoring not yet added.
- Deployment: Dockerfile now copies Prisma assets; migrate deploy runs before server start. Compose requires ADMIN_PASSWORD_HASH and SESSION_SECRET to be set.

## 2026-01-06T12:30:00Z
- Phase 0 completed per plan: Prisma schema + seed (Starlight Meadow 2026, 30 aliases, 6 shifts), auth with signed cookies, env placeholders, port palette (43000/45432) applied in compose/Dockerfile.
- Plan alignment: Phase 0 roadmap items done (schema, migration, seed, auth, Docker). Remaining are Phase 1+ features: shifts/preferences CRUD + UI, assignment algorithm (hard gender balance, core-only min shifts), coverage dashboards, manual swaps, PDF export, audit UI, config UI, monitoring/tests.
- Compliance gaps: No FR-001..FR-007 UI/API beyond auth yet; no FR-009 audit UI; no FR-012 coverage view; pseudonym→name mapping remains external; production cloud deploy not configured (only dev compose).

