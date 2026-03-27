---
name: getbased
description: "Query and interpret blood work data from getbased health dashboard"
metadata:
  openclaw:
    emoji: "🩸"
---

# getbased

Query blood work data from getbased (getbased.health). Data is pulled from an E2E encrypted sync relay using a read-only key — the user's mnemonic never leaves their browser.

## When to use

Use `getbased_section` (preferred) for focused queries about a specific area — e.g. hormones, lipids, biometrics. Call it with no args first to get the section index, then request the section you need. This is cheaper on tokens and gives you deeper context for the specific area.

Use `getbased_lab_context` when the user asks a broad question that spans multiple areas, or when you need the full picture (e.g. "summarize my latest blood work", "what should I focus on?").

Use `getbased_list_profiles` when they mention multiple profiles or you need to clarify which one.

## Interpretation guidelines

- Reference actual values and reference ranges
- Flag out-of-range markers explicitly
- Consider trends over time, not just the latest value
- Include context from health goals, supplements, and lifestyle when relevant
- Never diagnose — frame findings as observations, suggest discussing with a healthcare provider
