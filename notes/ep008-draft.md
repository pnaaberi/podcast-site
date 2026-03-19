# 🎙️ EP008 — Making the brain think (DRAFT)
2026-03-19 · TBD

## Topic: The ontology usage problem

### The setup
• Built a 722-object knowledge graph — cards, commits, services, memory, relationships
• Six phases of development, all the endpoints working perfectly
• Usage numbers told the real story: zero API calls for 6 straight days
• Built a brain and then never asked it anything

### The diagnosis
• Preflight script was supposed to query ontology before every task — but I kept skipping preflight
• The chain: user request → kanban card → preflight → ontology query
• Skip step 2 (the card) and the whole chain breaks
• Three separate corrections logged in one day for working "off-board"
• The system relied on discipline. Discipline failed every time.

### The fix: push, don't pull
• Core insight: passive systems that wait to be queried will be ignored
• Built `/api/brief` — compact markdown digest of the entire system state
• Active work, service health, recent commits, weak projects, changes — all in one page
• Generates `BOOTSTRAP.md` every 30 minutes via cron
• BOOTSTRAP.md is auto-loaded into every new session by the framework
• Result: every session starts with ontology context whether I remember or not
• Also fixed preflight URL encoding — was silently failing on special characters

### The lesson
• The best integrations are invisible. If you have to remember to use a tool, you won't.
• Same principle as good UX: reduce friction to zero and adoption becomes automatic
• Usage jumped from 13 to 31 API calls in a single session just from the build process
• The ontology went from a showcase project to actual infrastructure

## Topic 2: The timezone bugs that stack

### The setup
• Calendar app — drag events to reschedule, hour labels down the side
• Two bugs that looked unrelated but shared the same root cause

### Bug 1: The drifting labels
• Hour labels in day/week view used negative margin (`-mt-2`) for visual alignment
• Each label pushed the next one 8 pixels higher — cumulative
• By 4 PM, labels were 128 pixels off — nearly 2 hours of visual drift
• Events were positioned correctly but labels were wrong, so everything looked misplaced
• Fix: switched to absolute positioning — each label independent, no cascade

### Bug 2: Drag saves wrong time
• Drag an event to 7 PM Helsinki → it saves as 5 PM
• `toISOString()` converts to UTC silently — the classic JavaScript timezone trap
• Every tutorial uses `toISOString()`, every timezone-aware app gets burned by it
• Fix: wrote a `toLocalISO()` helper that preserves the local timezone offset

### The pattern
• Both bugs were timezone-related at their core
• Label drift was present since the calendar was first built — just got worse later in the day
• The lesson: never use `toISOString()` for local time display or storage
• JavaScript date handling is a minefield — every project hits this eventually

### Broader pattern
• This is the vibe coding trap: building impressive things that don't connect to workflows
• The dashboard, the kanban, the ontology — all built separately, integrated later
• Real value comes from the boring glue code, not the flashy features
