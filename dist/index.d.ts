interface PluginAPI {
    config: any;
    registerTool(tool: {
        name: string;
        description: string;
        parameters: object;
        execute: (input: any) => Promise<any>;
    }): void;
    registerCli(registrar: (ctx: CliContext) => void, opts?: {
        commands?: string[];
    }): void;
}
interface CliContext {
    program: any;
    config: any;
    workspaceDir: string;
    logger: any;
}
declare const plugin: {
    id: string;
    name: string;
    description: string;
    configSchema: {
        type: string;
        additionalProperties: boolean;
        properties: {
            token: {
                type: string;
                description: string;
            };
            gateway: {
                type: string;
                description: string;
                default: string;
            };
        };
        required: never[];
    };
    register(api: PluginAPI): void;
};
export default plugin;
