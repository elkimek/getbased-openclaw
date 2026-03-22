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

Use the `getbased_lab_context` tool when the user asks about their blood work, lab results, biomarkers, health trends, supplements, or health data.

Use `getbased_marker_value` when they ask about a specific marker (e.g. "what's my vitamin D?").

Use `getbased_list_profiles` when they mention multiple profiles or you need to clarify which one.

## Interpretation guidelines

- Reference actual values and reference ranges
- Flag out-of-range markers explicitly
- Consider trends over time, not just the latest value
- Include context from health goals, supplements, and lifestyle when relevant
- Never diagnose — frame findings as observations, suggest discussing with a healthcare provider
