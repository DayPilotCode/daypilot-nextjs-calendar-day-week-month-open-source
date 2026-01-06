- timestamp: 2026-01-06T10:55:00Z
  actions:
    - phase0: replaced legacy DayPilot scaffold with Tailwind baseline layout/home/login
    - phase0: added Prisma schema for event/team/shift/preference/assignment/config/audit/system models
    - phase0: seeded Starlight Meadow 2026 sample (30 aliases, 6 shifts, event config) via Prisma seed
    - phase0: implemented signed cookie auth (ADMIN_PASSWORD_HASH, SESSION_SECRET, TTL envs) + middleware/login API
    - phase0: aligned Docker (app 43000->3000, Postgres 45432->5432) and .env.* templates; ran migrate dev + seed against local DB

