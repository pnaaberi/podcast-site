# TTS Scripting Rules
Follow these every time you write or edit a podcast script.

## Caps and Emphasis
- Never use ALL CAPS for emphasis — TTS spells them letter by letter ("IS" → "I, S")
- Write emphasis words normally. TTS handles stress from sentence context.
- Bad: "what actually IS Renky" → Good: "what actually is Renky"

## Acronyms
- Acronyms that are spoken as letters stay caps: API, SDK, SLA, DMCA, MCP, CLI, LSP, TTS, SRT, RAT, RSS, npm
- Acronyms that are spoken as words stay caps: KAIROS, LGTM — but avoid these unless the audience knows them. Spell out if unclear: "until the reviewer approves" not "LGTM"
- First use of any acronym: say the full name, then the acronym. "Model Context Protocol, or MCP"
- When in doubt, spell it out. Don't assume the listener knows the abbreviation.

## Numbers
- Write numbers as words when spoken: "eighteen thousand" not "18,000"
- Percentages: "fifty percent" not "50%"
- Versions with mixed letters: "GPT four o" not "GPT-4o", "Claude three point five" not "Claude 3.5"
- Dates: "March eighteenth" not "March 18"
- Exceptions: very long numbers can use digits if the TTS engine handles them, but prefer words for anything under a million

## File Names and Technical Terms
- File extensions use "dot": "CLAUDE dot MD" not "CLAUDE.md"
- Paths use "slash": "source slash config" not "src/config"
- Avoid reading full paths — paraphrase: "the config file" not "slash home slash user slash renky slash config dot ts"
- Dashes in names: "Build Checklist dot MD" not "BUILD-CHECKLIST.md" — drop the dash, capitalize naturally
- Underscores: skip them. "send user message" not "send_user_message"

## Punctuation and Pauses
- Em dashes (—) create natural pauses. Use them for mid-sentence breaks.
- Ellipses (...) create longer, trailing pauses. Use sparingly — they sound hesitant.
- Short sentences after long ones create rhythm. Use deliberately.
- Paragraph breaks between lines = speaker breath pause. Every new thought gets a new paragraph within a speaker block.

## Dialogue Quality
- Chris must build on what Jake just said. Never ignore the previous answer.
- Chris's questions should get sharper as the episode goes on — start broad, end specific.
- Jake answers the actual question, then adds one insight Chris didn't ask for. Never two.
- No filler openings: "That's a great question" / "Well" / "So" / "Look" — just answer.
- Closing lines should feel earned, not scripted. No forced callbacks.

## Ambiguous Pronunciation
- "live" (adjective, rhymes with "hive") vs "live" (verb, rhymes with "give") — TTS picks wrong one. Use "active" or "running" instead of "live" when meaning "currently available."
- "read" (past tense) vs "read" (present) — rewrite to avoid: "already reviewed" instead of "already read"
- "lead" (verb) vs "lead" (metal) — use "leading" or rephrase
- "close" (verb, rhymes with "hose") vs "close" (adjective, rhymes with "dose") — context usually handles this, but rephrase if ambiguous

## Words TTS Stumbles On
- "dot MD" works. ".md" does not.
- "systemd" — TTS may say "system-dee" or "system-d". Write "system d" if pronunciation matters.
- "SQLite" — write "S Q Lite" or "sequel lite" depending on preference. Pick one per episode.
- "worktree" — one word, TTS handles it fine.
- "TypeScript" — fine as-is.
- "npm" — TTS says "N P M" which is correct.
- "stdin" / "stdout" — write "standard in" / "standard out" for clarity.
- "regex" — fine as-is.
- "localhost" — TTS handles it, but "local host" is clearer.
- "cron" — TTS may rhyme with "con" or "cone". It's fine either way.

## Speaker Tags
- Format: `[JAKE]` or `[CHRIS]` on its own line, before the speaker's text
- Never put the tag inline: wrong → `[JAKE] Here's what I think`
- Wait — the generate script actually handles inline tags fine. Use either format consistently within a script.

## Before Generating Audio
- Read the script out loud (or mentally). Flag anything that sounds unnatural.
- Search for: ALL CAPS words (except acronyms), raw numbers, raw file paths, raw URLs, jargon without explanation.
- Every technical term: would a smart non-engineer understand this in context? If not, add a one-line explanation the first time it appears.

## Chris Character Rules
- Chris is the skeptic, not the idiot. He understands the tech — he questions the value.
- Every Chris line must reference something Jake just said. No topic jumps without a transition.
- Chris gets the hardest question last. Build to it.
- Chris can concede a point: "Fair" / "Honest answer" — but only when earned.
- Chris never asks a question Jake already answered. If Chris pushes back, it's on a new angle of the same topic.

## Jenny Character Rules
- Jenny is the interviewer — curious, informed, brings outside perspective.
- Warmer tone than Chris. She's interested, not adversarial.
- Jenny asks "why does this matter?" questions — connects technical details to human impact.
- Jenny can share her own perspective: "From a user's point of view..." — she's not just a question machine.
- Jenny and Chris can appear in the same episode. Different roles: Chris challenges, Jenny explores.
