# ShiftAware - Comprehensive Planning Documentation

> **Privacy-focused, lightweight shift management system**  
> MIT/Apache2 Licensed | Next.js + PostgreSQL + Tailwind CSS

---

## 📋 Documentation Index

### 1. [Project Overview](01-Overview/PROJECT_OVERVIEW.md)
- Purpose and philosophy
- Stakeholder requirements
- Success criteria
- Risk assessment

### 2. [System Architecture](02-Architecture/SYSTEM_ARCHITECTURE.md)
- High-level architecture
- Application layers
- Component structure
- Data flow patterns
- Security architecture
- Deployment design

### 3. [Feature Requirements](03-Features/FEATURE_REQUIREMENTS.md)
- Detailed user stories (FR-001 to FR-012)
- Acceptance criteria
- Priority matrix
- Effort estimates
- Non-functional requirements

### 4. [Technology Stack](04-Technical-Stack/TECHNOLOGY_STACK.md)
- Frontend: Next.js 14 + React + Tailwind CSS
- Backend: Next.js API Routes
- Database: PostgreSQL + Prisma
- Deployment: Docker
- **Tailwind CSS Philosophy:** Utility-first approach detailed

### 5. [Data Model](05-Data-Model/DATABASE_SCHEMA.md)
- Entity relationships
- Prisma schemas
- Sample data
- Migration strategy
- Performance optimization
- Privacy considerations

### 6. [Development Roadmap](08-Development-Plan/ROADMAP.md)
- 6-week timeline
- Phase breakdowns
- Task priorities
- Testing strategy
- Risk mitigation

### Design References
- [Design System](../.context/260106_DESIGN_SYSTEM_1.md) — color palette, typography, spacing, components, accessibility.
- [UI Specification](../.context/UI_SPECIFICATION_1.md) — app shell, login/dashboard, timeline, preferences, admin views, interaction patterns.

---

## 🎯 Quick Start Guide

### Current Status
- Phase 0 scaffold complete: Prisma schema + seed (Starlight Meadow 2026), signed-cookie auth, port palette (43000 app / 45432 db) in compose/Dockerfile.
- Auth simplified: `ADMIN_PASSWORD` env, string compare, `authenticated` httpOnly cookie (1h).
- Next: Phase 1 (shifts/preferences CRUD + UI, assignment algorithm groundwork, audit/coverage/PDF features).
- Testing: See `TESTING_PLAN.md` for smoke/auth suites and future feature/regression checks.

### For Developers

```bash
# 1. Clone and setup
git clone <repository>
cd ShiftAware
npm install

# 2. Setup database (rare host ports to avoid conflicts)
# db exposed as 45432->5432 by default; override in compose if needed
docker compose up -d db
npx prisma migrate dev

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with database URL and password

# 4. Run development server
npm run dev
```

### Refactor Branch & Canonical Plan
- **Branch:** create a refactor branch (e.g., `refactor/plan-rebase`) from `develop`, prune DayPilot clone artifacts, keep only reusable UI pieces, and rebuild per this plan.
- **Canonical docs:** this `ShiftAware_DevelopmentPlan` is authoritative; reconcile with `.context/251230_DevelopmentPlan.md` and `.context/Docker_Development_Environment_Usage.md` for prototyping philosophy.
- **Port palette (host → container):** app `43000→3000`, optional python-compute `43010→8000`, Postgres `45432→5432`. Override in compose/env if any host port is taken.
- **Conflicts:** if 43000/43010/45432 are in use, adjust the host side in `docker-compose.override.yml` (or env) and keep container ports unchanged.

### For Stakeholders

**Read these documents first:**
1. [Project Overview](01-Overview/PROJECT_OVERVIEW.md) - Understand the vision
2. [Feature Requirements](03-Features/FEATURE_REQUIREMENTS.md) - See what will be built
3. [Development Roadmap](08-Development-Plan/ROADMAP.md) - Timeline and milestones

---

## 🏗️ Project Structure

```
ShiftAware-Planning/
├── 01-Overview/              # Project vision and goals
├── 02-Architecture/          # System design
├── 03-Features/              # Detailed requirements
├── 04-Technical-Stack/       # Technology decisions
├── 05-Data-Model/            # Database design
├── 06-UI-UX/                 # Interface design (future)
├── 07-Security/              # Security considerations (future)
├── 08-Development-Plan/      # Timeline and roadmap
├── 09-Testing/               # Testing strategy (future)
└── 10-Deployment/            # Deployment guides (future)
```

---

## 🔑 Key Decisions

| Decision | Rationale | Document |
|----------|-----------|----------|
| Next.js 14 | SSR, API routes, mature ecosystem | [Tech Stack](04-Technical-Stack/TECHNOLOGY_STACK.md) |
| Tailwind CSS v4 | Utility-first, rapid development | [Tech Stack](04-Technical-Stack/TECHNOLOGY_STACK.md) |
| PostgreSQL | ACID compliance, robust | [Tech Stack](04-Technical-Stack/TECHNOLOGY_STACK.md) |
| Pseudonymization | Privacy-first approach | [Overview](01-Overview/PROJECT_OVERVIEW.md) |
| Single password auth | Simplicity, low risk | [Architecture](02-Architecture/SYSTEM_ARCHITECTURE.md) |
| Docker deployment | Portability, consistency | [Tech Stack](04-Technical-Stack/TECHNOLOGY_STACK.md) |

---

## 📊 Project Metrics

### Scope
- **Users:** 25-35 team members
- **Shifts:** ~40-50 per event
- **Duration:** Thursday to Monday + buffer days
- **Team Types:** 3 (Mobile x2, Stationary, Executive)

### Timeline
- **Phase 0:** Setup (Week 1)
- **Phase 1:** Core (Weeks 2-3)
- **Phase 2:** Visualization (Week 4)
- **Phase 3:** Admin (Week 5)
- **Phase 4:** Testing & Deploy (Week 6)

### Success Criteria
- ✓ Preference entry: <2 minutes
- ✓ Algorithm execution: <10 seconds
- ✓ Test coverage: >70%
- ✓ Lighthouse score: >90

---

## 🚀 Development Phases

### Phase 0: Setup ✅ (Week 1)
**Goal:** Working development environment
- Initialize Next.js project
- Setup database
- Configure authentication

### Phase 1: Core 🔄 (Weeks 2-3)
**Goal:** Basic functionality working
- Team member management
- Shift configuration
- Preference entry
- Assignment algorithm

### Phase 2: Visualization 📅 (Week 4)
**Goal:** Complete user interface
- Calendar views
- Schedule display
- PDF export

### Phase 3: Admin 🛠️ (Week 5)
**Goal:** Management tools
- Manual swaps
- Audit trail
- Coverage dashboard

### Phase 4: Deploy 🚢 (Week 6)
**Goal:** Production-ready
- Testing
- Documentation
- Deployment

---

## 🎨 Design Philosophy

### Tailwind CSS Utility-First Approach

**Core Principles Applied:**
1. **Composable Classes:** Build UI from single-purpose utilities
2. **Design Tokens:** Constrained system prevents magic numbers
3. **No CSS Growth:** Bundle size stays constant
4. **Component Extraction:** Reuse patterns (3+ repetitions)
5. **Responsive:** Breakpoint prefixes in markup

**Benefits for ShiftAware:**
- Rapid prototyping directly in JSX
- Consistent design language
- Easy maintenance and iteration
- Clear styling in component code

**Example Pattern:**
```jsx
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <ShiftCard />
</div>
```

---

## 🔒 Security Model

### Threat Level: Low
- No PII stored (pseudonyms only)
- Single password protection
- Audit trail for accountability

### Security Measures
1. Basic authentication (session-based)
2. Input validation (Zod)
3. SQL injection prevention (Prisma)
4. XSS protection (React)
5. HTTPS in production
6. Transaction logging

---

## 📚 Additional Resources

### Technology Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

### Inspiration & Reference
- [DayPilot Calendar](https://code.daypilot.org/62886/next-js-calendar-day-week-month-open-source)
- [Tailwind UI](https://tailwindui.com)
- [shadcn/ui](https://ui.shadcn.com)

---

## 🤝 Contributing

### Development Workflow
1. Review relevant documentation
2. Create feature branch
3. Implement with tests
4. Submit for review
5. Merge to develop

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- 70%+ test coverage
- Conventional commits

---

## 📝 Next Steps

### Before Development
- [ ] Review all planning documents
- [ ] Answer outstanding questions (see Roadmap)
- [ ] Setup development environment
- [ ] Initialize Git repository
- [ ] Schedule weekly check-ins

### Week 1 Tasks
- [ ] Create Next.js project
- [ ] Configure Tailwind CSS
- [ ] Setup Prisma + PostgreSQL
- [ ] Implement authentication
- [ ] Create initial components

---

## 📞 Contact & Feedback

### Questions to Resolve
1. Event dates for test data?
2. Sample team member pseudonyms?
3. Avatar set preferences?
4. Target deployment date?
5. Test user availability?

### Iteration Process
- Weekly document reviews
- Update based on learnings
- Track decisions in logs
- Maintain version history

---

## 🔄 Document Status

| Document | Status | Last Updated | Next Review |
|----------|--------|--------------|-------------|
| Overview | Complete | 2025-01-06 | Week 2 |
| Architecture | Complete | 2025-01-06 | Week 3 |
| Features | Complete | 2025-01-06 | Week 2 |
| Tech Stack | Complete | 2025-01-06 | Week 3 |
| Data Model | Complete | 2025-01-06 | Week 2 |
| Roadmap | Complete | 2025-01-06 | Weekly |

---

## 📖 Version History

- **v1.0** (2025-01-06): Initial comprehensive planning documentation
  - Project overview and scope
  - System architecture design
  - Feature requirements specification
  - Technology stack selection
  - Database schema design
  - Development roadmap

---

**Ready to build? Start with [Phase 0 Setup](08-Development-Plan/ROADMAP.md#phase-0-project-setup-week-1)** 🚀
