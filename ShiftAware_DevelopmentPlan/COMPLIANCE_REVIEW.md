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

