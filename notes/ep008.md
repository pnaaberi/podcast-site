# EP008: Trust But Verify

**Duration:** 5:23 | **Published:** 2026-03-22

## Summary
The industry is scaling AI agent autonomy without scaling agent verification. We built a 230-line bash script that catches what enterprise frameworks need thousands of lines for — and found the exact gap where it still fails.

## Topics Covered
- CodeRabbit's 470-repo study: AI creates 1.7x more bugs, 75% are logic errors
- The transcript vs outcome problem (Anthropic's eval research)
- babysit.sh: deterministic post-completion verification
- Why bash + git + grep beats LLM-as-judge for safety layers
- The scorecard feedback loop: failures → patterns → rules → enforcement
- Comparison: Anthropic evals, Superpowers, TDD Guard, GitHub Agentic Workflows

## Two Things to Build
1. **TDD flag for babysit.sh** — test file existence checking per changed source file
2. **Semantic compliance layer** — LLM judge on top of deterministic checks (additive, not replacement)

## Key Insight
The most important code in an agentic system isn't the agent. It's the verification layer that runs after the agent finishes.

## Sources
- [CodeRabbit: State of AI vs Human Code Generation](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report)
- [Anthropic: Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Stack Overflow: Are Bugs Inevitable with AI Coding Agents?](https://stackoverflow.blog/2026/01/28/are-bugs-and-incidents-inevitable-with-ai-coding-agents/)
- [Microsoft Agent Governance Toolkit](https://github.com/microsoft/agent-governance-toolkit)
