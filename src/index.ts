// getbased OpenClaw Plugin
// Registers tools for querying blood work data from getbased via context gateway

interface PluginAPI {
  config: any;
  registerTool(tool: {
    name: string;
    description: string;
    parameters: object;
    execute: (input: any) => Promise<any>;
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

const plugin = {
  id: 'getbased',
  name: 'getbased',
  description: 'Query and interpret blood work data from getbased health dashboard',
  configSchema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      token: {
        type: 'string',
        description: 'Read-only token from getbased Settings > Data > Messenger Access',
      },
      gateway: {
        type: 'string',
        description: 'Context gateway URL (default: https://sync.getbased.health)',
        default: 'https://sync.getbased.health',
      },
    },
    required: ['token'],
  },

  register(api: PluginAPI) {
    const config: PluginConfig = (api as any).pluginConfig;
    if (!config?.token) {
      console.error('[getbased] No token configured. Set it in plugins.entries.getbased.config.token');
      return;
    }

    api.registerTool({
      name: 'getbased_lab_context',
      description: 'Get a summary of the user\'s blood work data, health context, supplements, and goals from getbased. Use this when the user asks about their labs, biomarkers, or health trends.',
      parameters: {
        type: 'object',
        properties: {
          profileName: {
            type: 'string',
            description: 'Profile name to query (optional — context includes the active profile by default)',
          },
        },
      },
      execute: async (_input: { profileName?: string }) => {
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
      parameters: {
        type: 'object',
        properties: {},
      },
      execute: async () => {
        const data = await fetchContext(config);
        if (data.error) return { error: data.error };
        return {
          profiles: data.profiles || [],
          updatedAt: data.updatedAt,
        };
      },
    });
  },
};

export default plugin;
