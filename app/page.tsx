export default function Home() {
  return (
    <div className="space-y-4 rounded-xl border border-shift-border bg-[#0d1629] p-6 shadow-card">
      <h2 className="text-2xl font-semibold text-slate-50">ShiftAware</h2>
      <p className="text-slate-300">
        Phase 0 baseline is ready. Authentication is enabled, database and Prisma
        are configured, and the dev environment matches the ShiftAware plan.
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-400">
        <li>Login via <code className="rounded bg-slate-800 px-1 py-0.5">/login</code> using the shared password.</li>
        <li>Database runs on host port 45432 (Postgres 16, Prisma schema + seed data).</li>
        <li>App runs on host port 43000 (container 3000) via Docker Compose.</li>
      </ul>
    </div>
  );
}
