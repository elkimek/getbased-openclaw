# getbased OpenClaw Plugin

An [OpenClaw](https://openclaw.ai) plugin that lets you chat about your blood work data from [getbased](https://getbased.health) over any messenger (SimpleX, Matrix, Signal, etc.).

## How it works

```
getbased (browser)
  ├── your data, your mnemonic
  ├── generates a read-only token
  └── pushes lab context to gateway on every save

Context Gateway (sync.getbased.health/api/context)
  └── stores context text behind token auth

This Plugin (on your OpenClaw server)
  ├── fetches context with the token
  └── model interprets and responds in your messenger
```

Your mnemonic never leaves your browser. The plugin receives the same lab context text the getbased AI chat uses — not raw data.

## Tools

| Tool | Description |
|---|---|
| `getbased_lab_context` | Full lab summary with biomarkers, context cards, supplements, goals |
| `getbased_list_profiles` | List available profiles |

## Setup

### 1. Enable messenger access in getbased

Go to **Settings > Data > Messenger Access** and toggle it on. Copy the read-only token.

### 2. Install the plugin

```bash
mkdir -p ~/.openclaw/plugins && cd ~/.openclaw/plugins
git clone https://github.com/elkimek/getbased-openclaw.git
cd getbased-openclaw && npm install && npm run build
openclaw plugins install --link ~/.openclaw/plugins/getbased-openclaw
```

### 3. Set your token

```bash
openclaw getbased-setup
```

This will prompt you to paste your token, verify it against the gateway, and save it to your config.

### 4. Restart the gateway

```bash
systemctl --user restart openclaw-gateway.service
```

### 5. Use it

Ask about your labs in any connected messenger:

> "How's my vitamin D?"
> "What markers are out of range?"
> "Summarize my latest blood work"

## Security

- **Read-only**: the token grants access to lab context text only — no raw data, no write access
- **Self-hosted**: both the OpenClaw instance and the gateway run on your own infrastructure
- **Revocable**: regenerate the token in getbased to revoke access instantly
- **No mnemonic exposure**: the token is independent of your sync mnemonic

## License

GPL-3.0
