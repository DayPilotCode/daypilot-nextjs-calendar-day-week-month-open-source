- timestamp: 2026-01-06T16:00:00Z
  actions:
    - phase2: initialized branch from main for Phase 2: Visualization & Export
    - phase2: updated ROADMAP.md to reflect Phase 1 completion and refine Phase 2/3 goals

- timestamp: 2026-01-06T19:30:00Z
  actions:
    - phase2: delivered day/week/month schedule views with coverage badges and balanced layout
    - phase2: added coverage/role/member filters, persistent view preference, and staffing metrics dashboard
    - phase2: upgraded PDF export (portrait/landscape, member-specific scope, pseudonym map) aligned to Phase 2 export goals
    - phase2: API shifts endpoint now returns assignments for visualization/export parity

- timestamp: 2026-01-06T20:10:00Z
  actions:
    - phase2: fixed PDF export scope labeling and member-only filtering; added scope line to exported PDFs
    - phase2: added unit tests for exportScheduleToPDF (orientation, member filtering, pseudonym map, coverage summary) using Vitest

- timestamp: 2026-01-06T20:20:00Z
  actions:
    - phase2: stabilized PDF export tests (Vitest) with jsPDF mocks; verified test suite passing

- timestamp: 2026-01-06T20:30:00Z
  actions:
    - phase2: updated ROADMAP Phase 2 checklist (calendar day/week/month complete; coverage badges, filters, metrics, persistent view; member-scope PDF with pseudonym map)
    - phase2: noted remaining Phase 2 gaps (pseudonym toggle UI, batch export, print CSS, mobile polish, advanced shift card interactions)

- timestamp: 2026-01-07T00:00:00Z
  actions:
    - phase2: plan Gantt migration — replace DayPilot with SVAR React Gantt (wx-react-gantt) per `.context/AGENT_INSTRUCTION_GANTT_REPLACEMENT.md`
    - phase2: scope views to Day/Week/Grid (remove Month), align with FR-005 Grid requirement
    - phase2: technical steps:
      - uninstall DayPilot; install wx-react-gantt (ensure date-fns present)
      - add `Timeline.tsx` wrapper: transform shifts→tasks/resources, pass start/end, click handler, coverage colors
      - add Gantt CSS overrides in globals using design tokens (colors, radius, shadows, typography)
      - integrate in schedule page with Day/Week/Grid toggles; preferences page for selection
      - ensure `/api/shifts` provides assignments for visualization/export parity
    - phase2: testing checklist:
      - render correctness (start/end, duration) and coverage badges
      - filters (role/member/status) + metrics still update
      - Day/Week/Grid toggle persistence; no Month view
      - PDF export remains functional (landscape/portrait, member scope, pseudonym map, coverage summary)
      - perf sanity on seed data; responsive scroll; accessibility (focus rings)

- timestamp: 2026-01-07T18:00:00Z
  actions:
    - phase2: removed wx-react-gantt (React 18 peer) and built custom Day/Week timeline with `react-window` + date-fns; kept Grid view for FR-005
    - phase2: mapped shifts to virtualized rows with time-scaled bars, coverage pills, and click handlers for shift/assignment interactions
    - phase2: dropped DayPilot/Gantt shims and added timeline styling to CalendarView
    - phase2: to-verify: schedule page Day/Week/Grid smoke and PDF export regression

- timestamp: 2026-01-07T21:00:00Z
  actions:
    - phase2: stabilized timeline usability (min bar widths, non-wrapping hour/day scale with horizontal scroll) and fixed preferences page Clock import
    - phase2: remaining TODOs for next session:
      - run manual smoke on `/schedule` Day/Week/Grid and `/preferences`
      - verify PDF export still passes (landscape/portrait, member scope, pseudonym map)
      - polish timeline responsiveness (mobile), and add tests per TESTING_PLAN visualization suite

