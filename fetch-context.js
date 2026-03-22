#!/usr/bin/env node
// fetch-context.js — Pull lab data from getbased Evolu relay (read-only)
// Usage: node fetch-context.js [--raw]
//
// Requires GETBASED_READONLY_KEY env var (base64-encoded readonly credentials)
// from getbased Settings > Data > Messenger Access

// TODO: Implementation
// 1. Decode GETBASED_READONLY_KEY → { id, encryptionKey, relay }
// 2. Connect to Evolu relay via WebSocket using SharedReadonlyOwner
// 3. Pull and decrypt profile data rows
// 4. Parse sync payload (v2 format: { _v: 2, importedData, profile, aiSettings })
// 5. Build lab context text (same format as buildLabContext in getbased)
// 6. Output to stdout for the OpenClaw model to consume

const key = process.env.GETBASED_READONLY_KEY;
if (!key) {
  console.error('GETBASED_READONLY_KEY not set. Generate one in getbased Settings > Data > Messenger Access.');
  process.exit(1);
}

const raw = process.argv.includes('--raw');

// Placeholder — will be implemented once @evolu/nodejs supports client connections
// or we implement the relay protocol directly (WebSocket + XChaCha20-Poly1305 decrypt + msgpack)
console.error('Not yet implemented. See README.md for the implementation plan.');
process.exit(2);
