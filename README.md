# ShiftAware (Phase 0)

Privacy-first, single-password shift management app. This repo now follows `ShiftAware_DevelopmentPlan` as the source of truth.

## Canonical docs
- `ShiftAware_DevelopmentPlan/README.md` (index to plan)
- `ShiftAware_DevelopmentPlan/ROADMAP.md` (phase breakdown)
- `ShiftAware_DevelopmentPlan/DATABASE_SCHEMA.md` (data model)

## Dev quickstart (Phase 0)
```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD + SESSION_TIMEOUT_MINUTES
docker compose up -d db      # Postgres on host 45432 -> container 5432
npx prisma migrate dev --name init
npx prisma db seed
npm run dev                  # app on host 43000 -> container 3000
```

## Ports (host → container)
- App: `43000 -> 3000`
- Postgres: `45432 -> 5432`
- Optional python compute (future): `43010 -> 8000`

## Auth
- Single shared password (`ADMIN_PASSWORD` in env, plain text comparison per plan)
- Simple HTTP-only session cookie (`authenticated=true`, 60 min default, configurable via `SESSION_TIMEOUT_MINUTES`)

## License
- Apache-2.0 (see `LICENSE`)
