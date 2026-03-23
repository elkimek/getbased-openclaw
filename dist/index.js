// getbased OpenClaw Plugin
// Registers tools for querying blood work data from getbased via context gateway
async function fetchContext(config) {
    const gateway = config.gateway || 'https://sync.getbased.health';
    let res;
    try {
        res = await fetch(`${gateway}/api/context`, {
            headers: { 'Authorization': `Bearer ${config.token}` },
        });
    }
    catch (err) {
        return { error: `Failed to reach getbased gateway: ${err.message}` };
    }
    if (!res.ok) {
        return { error: `getbased gateway returned ${res.status} ${res.statusText}` };
    }
    try {
        return await res.json();
    }
    catch {
        return { error: 'getbased gateway returned invalid JSON' };
    }
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
    register(api) {
        const config = api.pluginConfig;
        if (!config?.token) {
            console.error('[getbased] No token configured. Set it in plugins.entries.getbased.config.token');
            return;
        }
        api.registerTool({
            name: 'getbased_lab_context',
            description: 'Get a summary of the user\'s blood work data, health context, supplements, and goals from getbased. Use this when the user asks about their labs, biomarkers, or health trends.',
            parameters: {
                type: 'object',
                properties: {},
            },
            execute: async () => {
                const data = await fetchContext(config);
                if (data.error)
                    return { error: data.error };
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
                if (data.error)
                    return { error: data.error };
                return {
                    profiles: data.profiles || [],
                    updatedAt: data.updatedAt,
                };
            },
        });
    },
};
export default plugin;
