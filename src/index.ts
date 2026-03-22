// getbased OpenClaw Plugin
// Registers tools for querying blood work data from getbased via context gateway

interface PluginAPI {
  registerTool(tool: {
    name: string;
    description: string;
    inputSchema: object;
    handler: (input: any) => Promise<any>;
  }): void;
}

interface PluginConfig {
  token: string;
  gateway?: string;
}

interface GatewayResponse {
  context?: string;
  profiles?: Array<{ id: string; name: string }> | null;
  updatedAt?: string;
  error?: string;
}

async function fetchContext(config: PluginConfig): Promise<GatewayResponse> {
  const gateway = config.gateway || 'https://sync.getbased.health';
  const res = await fetch(`${gateway}/api/context`, {
    headers: { 'Authorization': `Bearer ${config.token}` },
  });
  return res.json() as Promise<GatewayResponse>;
}

export function register(api: PluginAPI, config: PluginConfig) {
  if (!config.token) {
    console.error('[getbased] No token configured. Generate one in getbased Settings > Data > Messenger Access.');
    return;
  }

  api.registerTool({
    name: 'getbased_lab_context',
    description: 'Get a summary of the user\'s blood work data, health context, supplements, and goals from getbased. Use this when the user asks about their labs, biomarkers, or health trends.',
    inputSchema: {
      type: 'object',
      properties: {
        profileName: {
          type: 'string',
          description: 'Profile name to query (optional — context includes the active profile by default)',
        },
      },
    },
    handler: async (_input: { profileName?: string }) => {
      const data = await fetchContext(config);
      if (data.error) return { error: data.error };
      return {
        context: data.context,
        updatedAt: data.updatedAt,
      };
    },
  });

  api.registerTool({
    name: 'getbased_list_profiles',
    description: 'List all profiles available in getbased.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async () => {
      const data = await fetchContext(config);
      if (data.error) return { error: data.error };
      return {
        profiles: data.profiles || [],
        updatedAt: data.updatedAt,
      };
    },
  });
}
