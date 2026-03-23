# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An OpenClaw plugin that lets users chat about their blood work data from [getbased](https://getbased.health) over any messenger. It fetches lab context from a sync gateway using a read-only token and exposes it as tools the LLM can call.

## Build commands

```bash
npm install        # install deps (just typescript)
npm run build      # compile TS → dist/
npm run dev        # compile in watch mode
```

No test runner or linter is configured.

## Architecture

Single-file plugin (`src/index.ts`) that exports a default object with `id`, `configSchema`, and a `register(api)` method — the OpenClaw plugin format. It registers two tools:

- **`getbased_lab_context`** — fetches the full lab summary (biomarkers, context cards, supplements, goals)
- **`getbased_list_profiles`** — lists available profiles

Both tools call `fetchContext()` which hits `{gateway}/api/context` with a Bearer token. The gateway URL defaults to `https://sync.getbased.health`.

## OpenClaw plugin API

Tools must use OpenAI-style field names, not Anthropic-style:
- `parameters` (not `inputSchema`)
- `execute` (not `handler`)

Plugin config is accessed via `api.pluginConfig` (not `api.config`, which is the full OpenClaw config).

The plugin manifest (`openclaw.plugin.json`) requires `id` and `configSchema` fields. Use `openclaw plugins install --link <path>` to install a local plugin.

## Plugin contract

- `openclaw.plugin.json` declares the plugin id, config schema (required `token`, optional `gateway`), and entry point (`dist/index.js`)
- `SKILL.md` provides the LLM with usage instructions and interpretation guidelines (when to call which tool, how to present results)
- Config is supplied via `~/.openclaw/openclaw.json` under `plugins.entries.getbased.config`
- `package.json` must include `"openclaw": { "extensions": ["./dist/index.js"] }`

## TypeScript config

- ESM (`"type": "module"` in package.json, `"module": "ESNext"` in tsconfig)
- Strict mode enabled
- Target ES2022
- Source in `src/`, output in `dist/`
