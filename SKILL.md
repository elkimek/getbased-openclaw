---
name: getbased
description: "Query and interpret blood work data from getbased health dashboard"
metadata:
  openclaw:
    emoji: "🩸"
    requires:
      env: ["GETBASED_READONLY_KEY"]
      bins: ["node"]
user-invocable: true
---

# getbased

Query your blood work data from getbased (getbased.health). All data is pulled from your E2E encrypted sync relay using a read-only key — your mnemonic never leaves your browser.

## When to use

Use this skill when the user asks about their blood work, lab results, biomarkers, health trends, supplements, or anything related to their health data in getbased.

Examples:
- "How are my liver markers trending?"
- "What's my latest vitamin D level?"
- "Summarize my recent labs"
- "What should I focus on?"
- "Compare my last two blood tests"

## Commands

### Fetch lab context

```bash
node ~/.openclaw/skills/getbased/fetch-context.js
```

This outputs a text summary of the user's lab data, context cards, supplements, and health goals — the same context the getbased AI chat uses. Pass it to the model for interpretation.

### Fetch raw data

```bash
node ~/.openclaw/skills/getbased/fetch-context.js --raw
```

Outputs raw JSON with all entries, dates, and values. Use this when the user asks for specific numbers or date comparisons.

## How to set up

1. In getbased, go to **Settings > Data > Messenger Access** and generate a read-only key
2. Add to your OpenClaw config (`~/.openclaw/openclaw.json`):

```json
{
  "skills": {
    "entries": {
      "getbased": {
        "env": {
          "GETBASED_READONLY_KEY": "your-readonly-key-here"
        }
      }
    }
  }
}
```

## Interpretation guidelines

- Always reference the actual values and reference ranges when answering
- Flag any out-of-range markers explicitly
- Consider trends over time, not just the latest value
- Include context from health goals, supplements, and lifestyle cards when relevant
- Never diagnose — frame findings as observations, suggest discussing with a healthcare provider
