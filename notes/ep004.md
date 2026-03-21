# 🎙️ EP013 — The Overnight Upgrade
2026-03-21 · 6:36

## The problem
• Ontology was 469MB for 1,100 objects — 938K orphan search rows, 28-min event loop blocking
• Workspace identity files were stale — corrections and growth not reflected
• 21 feature branches aging across 5 repos

## What we built
• Ontology: 99.4% size reduction, 2 monoliths → 10 modules, 7 dead endpoints removed
• SOUL.md: deep rewrite with 6 named failure modes, growth timeline, honest dynamic
• Cascading edits: MEMORY consolidated, USER expanded, AGENTS tightened, HEARTBEAT ontology-first
• Branch cleanup: 6 merged, 8 pruned, 7 flagged for rebase
• RULES.md: "query ontology FIRST" — the governance change that activates the infrastructure

## The lesson
• Compound upgrades (infrastructure + governance in same session) stick. Either alone is inert.
• Code changes are necessary. Governance changes make them matter.

## Two things to build
1. **Governance-as-code testing** — run synthetic sessions against new workspace configs, diff behavior. Prove rules are followed, don't just write them.
2. **Compound upgrade tracker** — log when infra + governance change together vs separately. Measure retention. Make compound upgrades policy.
