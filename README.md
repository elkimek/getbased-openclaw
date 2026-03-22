# getbased OpenClaw Skill

An [OpenClaw](https://openclaw.ai) skill that lets you chat about your blood work data from [getbased](https://getbased.health) over any messenger (WhatsApp, Telegram, Discord, etc.).

## How it works

```
getbased (browser)
  ├── your data, your mnemonic
  ├── generates a read-only key for OpenClaw
  └── pushes encrypted data to relay

Evolu Relay (sync.getbased.health)
  └── stores encrypted blobs

This Skill (on your OpenClaw server)
  ├── pulls data using read-only key (no mnemonic needed)
  ├── decrypts locally, builds lab context
  └── model interprets and responds in your messenger
```

Your mnemonic never leaves your browser. The skill uses a derived read-only key that can decrypt and pull data but cannot write, restore your identity, or derive the mnemonic.

## Setup

### 1. Generate a read-only key in getbased

Go to **Settings > Data > Messenger Access** and click **Generate read-only key**. Copy the key.

### 2. Install the skill

```bash
cp -r . ~/.openclaw/skills/getbased
```

### 3. Configure

Add to `~/.openclaw/openclaw.json`:

```json
{
  "skills": {
    "entries": {
      "getbased": {
        "env": {
          "GETBASED_READONLY_KEY": "your-key-here"
        }
      }
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

- **Read-only**: the skill cannot modify your data — enforced at the Evolu protocol level
- **No mnemonic exposure**: the read-only key is a one-way derivation from your mnemonic
- **Self-hosted**: both the OpenClaw instance and the Evolu relay run on your own infrastructure
- **Revocable**: regenerate the key in getbased to revoke access

## Roadmap

- [x] Skill definition (SKILL.md)
- [ ] Evolu read-only client (fetch-context.js)
- [ ] Lab context builder (port of buildLabContext)
- [ ] v2: Write access — drop PDFs in messenger, parsed and synced to getbased

## Architecture

The read-only key encodes an Evolu `SharedReadonlyOwner` — `id + encryptionKey` without `writeKey`. This is a first-class Evolu concept: the sync protocol accepts connections without a write key and serves data but rejects mutations.

The fetch script connects to the relay via WebSocket, pulls encrypted CRDT messages, decrypts them with XChaCha20-Poly1305, and reconstructs the profile data. No intermediate API server needed.

## License

GPL-3.0 — same as getbased.
