# getbased OpenClaw Plugin

An [OpenClaw](https://openclaw.ai) plugin that lets you chat about your blood work data from [getbased](https://getbased.health) over any messenger (WhatsApp, Telegram, Discord, etc.).

## How it works

```
getbased (browser)
  ├── your data, your mnemonic
  ├── generates a read-only key for OpenClaw
  └── pushes encrypted data to relay

Evolu Relay (sync.getbased.health)
  └── stores encrypted blobs

This Plugin (on your OpenClaw server)
  ├── pulls data using read-only key (no mnemonic needed)
  ├── decrypts locally, builds lab context
  └── model calls tools and responds in your messenger
```

Your mnemonic never leaves your browser. The plugin uses a derived read-only key (`SharedReadonlyOwner`) that can decrypt and pull data but cannot write, restore your identity, or derive the mnemonic.

## Tools

| Tool | Description |
|---|---|
| `getbased_lab_context` | Full lab summary — same context the getbased AI chat uses |
| `getbased_marker_value` | Latest value + trend for a specific biomarker |
| `getbased_list_profiles` | List all available profiles |

## Setup

### 1. Generate a read-only key in getbased

Go to **Settings > Data > Messenger Access** and click **Generate read-only key**. Copy the key.

### 2. Install the plugin

```bash
cd ~/.openclaw/plugins
git clone https://github.com/elkimek/getbased-openclaw.git
cd getbased-openclaw
npm install && npm run build
```

### 3. Configure

Add to `~/.openclaw/openclaw.json`:

```json
{
  "plugins": {
    "getbased": {
      "readonlyKey": "your-key-here"
    }
  }
}
```

### 4. Use it

Just ask about your labs in any connected messenger:

> "How's my vitamin D?"
> "What markers are out of range?"
> "Summarize my latest blood work"

## Security

- **Read-only**: the plugin cannot modify your data — enforced at the Evolu protocol level
- **No mnemonic exposure**: the read-only key is a one-way derivation from your mnemonic
- **Self-hosted**: both the OpenClaw instance and the Evolu relay run on your own infrastructure
- **Revocable**: regenerate the key in getbased to revoke access

## Roadmap

- [x] Plugin scaffold with tool definitions
- [x] Companion SKILL.md for model guidance
- [ ] Evolu read-only client (SharedReadonlyOwner → relay → decrypt)
- [ ] Lab context builder (port of buildLabContext)
- [ ] v2: Write access — drop PDFs in messenger, parsed and synced to getbased

## License

GPL-3.0
