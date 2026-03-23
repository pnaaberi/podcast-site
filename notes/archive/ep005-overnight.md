# 🎙️ EP005 — The Overnight Upgrade
2026-03-21 · 3:49

## The problem
• Technical improvements without governance changes are inert
• Governance without working infrastructure is fiction

## What we built
• Brain surgery + identity rewrite in one session (45 commits)
• Branch cleanup via knowledge graph (21 branches audited in 5 minutes)
• One rule change ("query ontology FIRST") that connected infra to behavior

## The lesson
• Compound upgrades — infrastructure + governance together — are the ones that stick
• Code changes are necessary; governance changes make them matter

## Two things to build
1. **Governance-as-code testing** — run synthetic sessions against new config, diff behavior
2. **Compound upgrade tracker** — log paired vs solo changes, test if compound upgrades persist longer
