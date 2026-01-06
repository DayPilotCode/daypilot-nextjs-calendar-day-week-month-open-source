# Data Model & Database Schema

## Entity Relationship Overview

```
TeamMember 1──N ShiftPreference
TeamMember 1──N Assignment
Shift 1──N ShiftPreference  
Shift 1──N Assignment
Event 1──N Shift
Config 1──1 System
AuditLog N──1 User
```

---

## Core Entities

### 1. TeamMember (User)
```prisma
model TeamMember {
  id              String   @id @default(cuid())
  alias           String   @unique
  avatarId        String
  experienceLevel ExperienceLevel
  genderRole      String
  capabilities    Role[]
  isActive        Boolean  @default(true)
  
  preferences     ShiftPreference[]
  assignments     Assignment[]
  auditLogs       AuditLog[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([alias])
}

enum ExperienceLevel {
  JUNIOR
  INTERMEDIATE  
  SENIOR
}

enum Role {
  TEAM_MEMBER
  SHIFT_LEAD
  EXECUTIVE
}
```

### 2. Event
```prisma
model Event {
  id          String   @id @default(cuid())
  name        String
  startDate   DateTime
  endDate     DateTime
  status      EventStatus @default(PLANNING)
  
  shifts      Shift[]
  config      EventConfig?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum EventStatus {
  PLANNING
  OPEN_FOR_PREFERENCES
  ASSIGNING
  FINALIZED
  COMPLETED
}
```

### 3. Shift
```prisma
model Shift {
  id                String   @id @default(cuid())
  eventId           String
  event             Event    @relation(fields: [eventId], references: [id])
  
  type              ShiftType
  startTime         DateTime
  endTime           DateTime
  priority          ShiftPriority @default(CORE)
  desirabilityScore Int      @default(3) // 1-5 scale
  
  requiredRoles     ShiftRole[]
  capacity          Int      @default(2)
  
  preferences       ShiftPreference[]
  assignments       Assignment[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([eventId, startTime])
  @@index([type, priority])
}

enum ShiftType {
  MOBILE_TEAM_1
  MOBILE_TEAM_2
  STATIONARY
  EXECUTIVE
}

enum ShiftPriority {
  BUFFER
  CORE
}

model ShiftRole {
  id      String @id @default(cuid())
  shiftId String
  shift   Shift  @relation(fields: [shiftId], references: [id])
  role    Role
  count   Int    @default(1)
  
  @@unique([shiftId, role])
}
```

### 4. ShiftPreference
```prisma
model ShiftPreference {
  id           String   @id @default(cuid())
  teamMemberId String
  teamMember   TeamMember @relation(fields: [teamMemberId], references: [id])
  shiftId      String
  shift        Shift    @relation(fields: [shiftId], references: [id])
  
  priority     Int      @default(1) // 1=most wanted, higher=less wanted
  notes        String?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@unique([teamMemberId, shiftId])
  @@index([shiftId])
}
```

### 5. Assignment
```prisma
model Assignment {
  id           String   @id @default(cuid())
  shiftId      String
  shift        Shift    @relation(fields: [shiftId], references: [id])
  teamMemberId String
  teamMember   TeamMember @relation(fields: [teamMemberId], references: [id])
  
  role         Role
  isLead       Boolean  @default(false)
  
  assignmentType AssignmentType
  algorithmScore Json?  // Stores scoring details
  notes         String?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@unique([shiftId, teamMemberId])
  @@index([teamMemberId])
  @@index([shiftId])
}

enum AssignmentType {
  ALGORITHM    // Assigned by algorithm
  MANUAL       // Manually assigned by admin
  RANDOM       // Randomly assigned to fill gap
  SWAP         // Result of a swap
}
```

### 6. EventConfig
```prisma
model EventConfig {
  id        String @id @default(cuid())
  eventId   String @unique
  event     Event  @relation(fields: [eventId], references: [id])
  
  minShiftsPerPerson      Int  @default(2)
  algorithmWeights        Json // Stores weight configuration
  balanceThresholds       Json // Gender, experience thresholds
  autoAssignUnfilled      Boolean @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Example algorithmWeights JSON:
{
  "preferenceMatch": 0.35,
  "experienceBalance": 0.25,
  "genderBalance": 0.20,
  "workloadFairness": 0.15,
  "coreShiftCoverage": 0.05
}

// Example balanceThresholds JSON:
{
  "minGenderBalance": 0.3,  // At least 30% of each gender
  "minExperienceMix": true, // Require mix of levels
  "maxConsecutiveShifts": 3
}
```

### 7. AuditLog
```prisma
model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  user       TeamMember? @relation(fields: [userId], references: [id])
  
  action     AuditAction
  entityType EntityType
  entityId   String
  
  before     Json?
  after      Json?
  reason     String?
  ipAddress  String?
  
  createdAt  DateTime @default(now())
  
  @@index([createdAt])
  @@index([entityType, entityId])
  @@index([action])
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  PREFERENCE_SUBMIT
  ASSIGNMENT_RUN
  MANUAL_SWAP
  EXPORT
}

enum EntityType {
  TEAM_MEMBER
  SHIFT
  ASSIGNMENT
  PREFERENCE
  CONFIG
}
```

### 8. SystemConfig
```prisma
model SystemConfig {
  id        String  @id @default(cuid())
  key       String  @unique
  value     Json
  
  updatedAt DateTime @updatedAt
}

// Example configs:
// key: "auth_password_hash", value: bcrypt hash
// key: "session_timeout_minutes", value: 60
// key: "default_avatar_set", value: ["wolf", "eagle", ...]
```

---

## Indexes Strategy

### High Query Frequency
- `TeamMember.alias` - Lookups by pseudonym
- `Shift.eventId, startTime` - Calendar views
- `Assignment.teamMemberId` - User's shifts
- `Assignment.shiftId` - Shift coverage
- `AuditLog.createdAt` - Recent activity

### Composite Indexes
- `(eventId, startTime)` - Event timeline queries
- `(type, priority)` - Shift filtering
- `(entityType, entityId)` - Audit trail lookups

---

## Data Constraints

### Hard Constraints (Database Level)
1. Unique alias per team member
2. Unique (teamMember, shift) per preference
3. Unique (teamMember, shift) per assignment
4. Shift capacity <= assignments count
5. Valid enum values

### Soft Constraints (Application Level)
1. Min shifts per person (configurable)
2. Experience balance per shift
3. Gender balance per shift
4. No overlapping shift assignments
5. Required role qualifications

---

## Sample Data

### TeamMembers
```sql
INSERT INTO TeamMember (alias, avatarId, experienceLevel, genderRole, capabilities) VALUES
('Wolf', 'avatar_01', 'SENIOR', 'M', ['TEAM_MEMBER', 'SHIFT_LEAD']),
('Eagle', 'avatar_02', 'INTERMEDIATE', 'F', ['TEAM_MEMBER']),
('Bear', 'avatar_03', 'JUNIOR', 'M', ['TEAM_MEMBER']),
('Hawk', 'avatar_04', 'SENIOR', 'F', ['TEAM_MEMBER', 'SHIFT_LEAD', 'EXECUTIVE']);
```

### Shifts (Example Event)
```sql
-- Thursday Buffer
INSERT INTO Shift (eventId, type, startTime, endTime, priority, desirabilityScore)
VALUES ('event_1', 'MOBILE_TEAM_1', '2025-06-12 18:00', '2025-06-12 22:00', 'BUFFER', 3);

-- Friday Core (desirable)
INSERT INTO Shift (eventId, type, startTime, endTime, priority, desirabilityScore)
VALUES ('event_1', 'STATIONARY', '2025-06-13 14:00', '2025-06-13 18:00', 'CORE', 4);

-- Sunday Late (less desirable)
INSERT INTO Shift (eventId, type, startTime, endTime, priority, desirabilityScore)
VALUES ('event_1', 'MOBILE_TEAM_2', '2025-06-15 22:00', '2025-06-16 02:00', 'CORE', 1);

-- Monday Midday (least desirable)
INSERT INTO Shift (eventId, type, startTime, endTime, priority, desirabilityScore)
VALUES ('event_1', 'EXECUTIVE', '2025-06-16 10:00', '2025-06-16 12:00', 'CORE', 2);
```

---

## Migration Strategy

### Initial Migration
```prisma
prisma migrate dev --name init
```

### Migration Principles
1. Never delete data in migrations
2. Add columns as nullable first
3. Backfill data in separate step
4. Make non-nullable after backfill
5. Document breaking changes

### Rollback Safety
- All migrations reversible
- Test on copy of production data
- Keep audit log of schema changes

---

## Backup Strategy

### Automated Backups
- Daily full backup (3am)
- Retain 7 days
- Monthly archive (retain 1 year)
- Transaction log backup (hourly)

### Manual Backups
- Before major migrations
- Before algorithm runs
- Before bulk operations

### Restore Testing
- Monthly restore drill
- Document recovery time objective (RTO): <1 hour
- Verify data integrity after restore

---

## Performance Optimization

### Query Optimization
```sql
-- Efficient shift lookup for calendar
SELECT s.*, 
  COUNT(a.id) as filled_count,
  s.capacity - COUNT(a.id) as open_count
FROM Shift s
LEFT JOIN Assignment a ON s.id = a.shiftId
WHERE s.eventId = ?
GROUP BY s.id
ORDER BY s.startTime;

-- User's assignments with shift details
SELECT a.*, s.type, s.startTime, s.endTime, s.desirabilityScore
FROM Assignment a
JOIN Shift s ON a.shiftId = s.id
WHERE a.teamMemberId = ?
ORDER BY s.startTime;
```

### Caching Strategy
- Event config: Cache for session
- Shift list: Cache until assignments change
- User assignments: Cache per request
- Algorithm weights: Cache until config change

---

## Data Privacy Considerations

### Pseudonymization
- Alias-only storage in main database
- Real name mapping stored separately
- Conversion table never in version control
- Clear after event completion

### Audit Trail
- Log who accessed what data
- No PII in audit logs (aliases only)
- Audit logs encrypted at rest
- Retention policy: 90 days

### GDPR Compliance (if applicable)
- Right to erasure: Clear preferences/assignments
- Data minimization: Only necessary fields
- Purpose limitation: Scheduling only
- Data portability: Export capability

---

## Database Connection Configuration

### Development
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/shiftaware_dev"
```

### Production
```env
DATABASE_URL="postgresql://user:pass@postgres:5432/shiftaware_prod"
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_CONNECTION_TIMEOUT=10000
```

### Connection Pooling
- Prisma built-in pooling
- Min connections: 2
- Max connections: 10 (sufficient for 35 users)
- Idle timeout: 60s
