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
        required: [],
    },
    register(api) {
        const config = api.pluginConfig;
        api.registerCli(({ program, config: fullConfig }) => {
            program
                .command('getbased-setup')
                .description('Set your getbased read-only token')
                .action(async () => {
                // Wait for OpenClaw's boot logs to flush, then clear screen
                await new Promise(r => setTimeout(r, 500));
                process.stdout.write('\x1B[2J\x1B[H');
                const { createInterface } = await import('readline');
                const rl = createInterface({ input: process.stdin, output: process.stdout });
                const ask = (q) => new Promise(resolve => rl.question(q, resolve));
                console.log('🩸 getbased setup\n');
                console.log('Go to getbased > Settings > Data > Messenger Access');
                console.log('and paste your read-only token below.\n');
                const token = (await ask('Token: ')).trim();
                rl.close();
                if (!token) {
                    console.error('No token provided.');
                    process.exit(1);
                }
                // Verify token works
                const gateway = fullConfig?.plugins?.entries?.getbased?.config?.gateway || 'https://sync.getbased.health';
                try {
                    const res = await fetch(`${gateway}/api/context`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (!res.ok) {
                        console.error(`Token rejected by gateway (${res.status}). Check that it's correct.`);
                        process.exit(1);
                    }
                    const data = await res.json();
                    if (data.error) {
                        console.error(`Gateway error: ${data.error}`);
                        process.exit(1);
                    }
                    console.log(`\n✓ Token verified (${data.profiles?.length ?? 0} profiles found)`);
                }
                catch (err) {
                    console.error(`Could not reach gateway: ${err.message}`);
                    process.exit(1);
                }
                // Write token to config
                const fs = await import('fs');
                const path = await import('path');
                const configPath = path.join(fullConfig?.meta?.configDir || `${process.env.HOME}/.openclaw`, 'openclaw.json');
                const raw = fs.readFileSync(configPath, 'utf-8');
                const cfg = JSON.parse(raw);
                cfg.plugins ??= {};
                cfg.plugins.entries ??= {};
                cfg.plugins.entries.getbased ??= { enabled: true };
                cfg.plugins.entries.getbased.config ??= {};
                cfg.plugins.entries.getbased.config.token = token;
                fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
                console.log('✓ Token saved to openclaw.json');
                console.log('\nRestart the gateway to activate:');
                console.log('  systemctl --user restart openclaw-gateway.service\n');
            });
        }, { commands: ['getbased-setup'] });
        if (!config?.token) {
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
