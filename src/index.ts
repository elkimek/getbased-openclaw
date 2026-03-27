// getbased OpenClaw Plugin
// Registers tools for querying blood work data from getbased via context gateway

interface PluginAPI {
  config: any;
  registerTool(tool: {
    name: string;
    description: string;
    parameters: object;
    execute: (...args: any[]) => Promise<any>;
  }): void;
  registerCli(registrar: (ctx: CliContext) => void, opts?: { commands?: string[] }): void;
}

interface CliContext {
  program: any; // Commander.js
  config: any;
  workspaceDir: string;
  logger: any;
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

function parseSections(context: string): Map<string, string> {
  const sections = new Map<string, string>();
  // Opening tags may have metadata (e.g. [section:hormones updated:2026-03-13])
  // but closing tags use just the base name (e.g. [/section:hormones])
  const regex = /\[section:(\S+)([^\]]*)\]([\s\S]*?)\[\/section:\1\]/g;
  let match;
  while ((match = regex.exec(context)) !== null) {
    const baseName = match[1];
    const meta = match[2].trim();
    const fullName = meta ? `${baseName} ${meta}` : baseName;
    sections.set(fullName, match[3].trim());
  }
  return sections;
}

function buildSectionIndex(context: string): Array<{ name: string; updated?: string; lines: number }> {
  const sections = parseSections(context);
  return Array.from(sections.entries()).map(([rawName, content]) => {
    const match = rawName.match(/^(\S+)\s+updated:(.+)$/);
    return {
      name: match ? match[1] : rawName,
      ...(match ? { updated: match[2] } : {}),
      lines: content.split('\n').filter(l => l.trim()).length,
    };
  });
}

async function fetchContext(config: PluginConfig): Promise<GatewayResponse> {
  const gateway = config.gateway || 'https://sync.getbased.health';
  let res: Response;
  try {
    res = await fetch(`${gateway}/api/context`, {
      headers: { 'Authorization': `Bearer ${config.token}` },
    });
  } catch (err: any) {
    return { error: `Failed to reach getbased gateway: ${err.message}` };
  }
  if (!res.ok) {
    return { error: `getbased gateway returned ${res.status} ${res.statusText}` };
  }
  try {
    return await res.json() as GatewayResponse;
  } catch {
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

  register(api: PluginAPI) {
    const config: PluginConfig = (api as any).pluginConfig;

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
          const ask = (q: string): Promise<string> =>
            new Promise(resolve => rl.question(q, resolve));

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
            const data = await res.json() as GatewayResponse;
            if (data.error) {
              console.error(`Gateway error: ${data.error}`);
              process.exit(1);
            }
            console.log(`\n✓ Token verified (${data.profiles?.length ?? 0} profiles found)`);
          } catch (err: any) {
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
      execute: async (_toolCallId: string) => {
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
      execute: async (_toolCallId: string) => {
        const data = await fetchContext(config);
        if (data.error) return { error: data.error };
        return {
          profiles: data.profiles || [],
          updatedAt: data.updatedAt,
        };
      },
    });

    api.registerTool({
      name: 'getbased_section',
      description: 'Get a specific section of the user\'s health data, or list all available sections. Call with no section name to get the index (section names + line counts). Call with a section name to get just that section\'s content. Sections include: biometrics, hormones, lipids, hematology, biochemistry, supplements, goals, genetics, context cards, etc.',
      parameters: {
        type: 'object',
        properties: {
          section: {
            type: 'string',
            description: 'Section name to retrieve (e.g. "hormones", "biometrics", "lipids"). Omit to get the section index.',
          },
        },
      },
      execute: async (_toolCallId: string, params: any) => {
        const data = await fetchContext(config);
        if (data.error) return { error: data.error };
        if (!data.context) return { error: 'No context available' };

        const sectionName = params?.section;

        if (!sectionName) {
          return {
            sections: buildSectionIndex(data.context),
            updatedAt: data.updatedAt,
          };
        }

        const sections = parseSections(data.context);
        const query = sectionName.toLowerCase().trim();
        // Exact match first, then prefix match (section names may include " updated:date")
        let matchKey = sections.has(query) ? query : undefined;
        if (!matchKey) {
          for (const k of sections.keys()) {
            if (k.toLowerCase().startsWith(query)) {
              matchKey = k;
              break;
            }
          }
        }
        if (!matchKey) {
          const available = Array.from(sections.keys()).map(k => k.split(' ')[0]);
          return {
            error: `Section "${sectionName}" not found`,
            available,
          };
        }
        return {
          section: matchKey,
          content: sections.get(matchKey)!,
          updatedAt: data.updatedAt,
        };
      },
    });
  },
};

export default plugin;
