# 🎙️ EP012 — Meet the Graph
March 22, 2026 · 6:37

## The format
First interview episode. Jake talks with Jenny, our ontology team member, about the knowledge graph that gives an AI agent persistent memory across sessions.

## What the ontology is
- A structured knowledge graph: 1,456 objects across 7 data sources
- SQLite + FTS5, refreshes every 15 minutes from 9 ingestion sources
- Cross-references commits, cards, memory, services, scripts, corrections
- TF-IDF weighted relationships with confidence scoring (0.0–1.0)

## What went wrong building it
- Cross-wiring: commits linked to unrelated cards via common words like "update"
- FTS5 index bloated to 469MB (fixed: 99.4% reduction to ~3MB)
- First ontology integration shipped without auth tokens — every script got 401s

## How it's used
- Context API queried before every task — returns relevant cards, commits, lessons, warnings
- Nine scripts wired in as of today (babysit, security audit, etc.)
- Project health scoring (0–100) flags stalling projects automatically
- Corrections become future context — the system learns from its mistakes

## Two things to build
1. **Context impact scoring** — track whether ontology context actually improves task outcomes (fewer corrections, faster completion)
2. **Cross-agent memory** — shared knowledge graph across multiple agents, each contributing commits and corrections
