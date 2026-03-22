// getbased OpenClaw Plugin
// Registers tools for querying blood work data from getbased via Evolu E2E encrypted sync

import type { PluginAPI } from '@openclaw/types';

interface PluginConfig {
  readonlyKey: string;
  relay?: string;
}

export function register(api: PluginAPI, config: PluginConfig) {
  const relay = config.relay || 'wss://sync.getbased.health';

  // TODO: Initialize Evolu SharedReadonlyOwner from config.readonlyKey
  // const { id, encryptionKey } = decodeReadonlyKey(config.readonlyKey);

  api.registerTool({
    name: 'getbased_lab_context',
    description: 'Get a summary of the user\'s blood work data, health context, supplements, and goals from getbased. Use this when the user asks about their labs, biomarkers, or health trends.',
    inputSchema: {
      type: 'object',
      properties: {
        profileName: {
          type: 'string',
          description: 'Profile name to query (optional, defaults to the most recently updated profile)',
        },
      },
    },
    handler: async (input: { profileName?: string }) => {
      // TODO: Connect to Evolu relay, pull data, build context
      // 1. WebSocket connect to relay with SharedReadonlyOwner credentials
      // 2. Pull encrypted CRDT messages for the owner
      // 3. Decrypt with XChaCha20-Poly1305 using encryptionKey
      // 4. Reconstruct importedData from CRDT state
      // 5. Build lab context text (port of buildLabContext from getbased)
      // 6. Return structured result

      return {
        error: 'Not yet implemented. See README.md for the implementation plan.',
      };
    },
  });

  api.registerTool({
    name: 'getbased_marker_value',
    description: 'Get the latest value and trend for a specific biomarker. Use when the user asks about a specific marker like glucose, vitamin D, testosterone, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        marker: {
          type: 'string',
          description: 'Marker key in category.name format (e.g. biochemistry.glucose, hormones.testosterone, vitamins.vitaminD)',
        },
        dateRange: {
          type: 'string',
          enum: ['30d', '90d', '1y', 'all'],
          description: 'How far back to look (default: all)',
        },
      },
      required: ['marker'],
    },
    handler: async (input: { marker: string; dateRange?: string }) => {
      // TODO: Pull specific marker data from Evolu
      return {
        error: 'Not yet implemented.',
      };
    },
  });

  api.registerTool({
    name: 'getbased_list_profiles',
    description: 'List all profiles available in getbased. Use when the user has multiple profiles or you need to identify which profile to query.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async () => {
      // TODO: Pull profile list from Evolu
      return {
        error: 'Not yet implemented.',
      };
    },
  });
}
