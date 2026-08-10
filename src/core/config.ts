import { z } from 'zod';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const packageMetadata = require('../../package.json') as { name: string };

const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;
const schema = z.object({
  identity: z.string().min(1),
  api: z.object({ host: z.string().min(1), port: z.number().int().min(1).max(65535) }),
  log: z.object({ level: z.enum(levels) }),
});

export type RuntimeConfig = z.infer<typeof schema>;

export class ConfigError extends Error {
  readonly code = 'CONFIG_INVALID';
  constructor(readonly context: Record<string, unknown>) {
    super('Invalid runtime configuration');
  }
}

export const loadConfig = (env: NodeJS.ProcessEnv): RuntimeConfig => {
  const parsed = schema.safeParse({
    identity: env.RUNTIME_IDENTITY ?? packageMetadata.name,
    api: { host: env.RUNTIME_API_HOST ?? '127.0.0.1', port: Number(env.RUNTIME_API_PORT ?? '4310') },
    log: { level: env.RUNTIME_LOG_LEVEL ?? 'info' },
  });
  if (!parsed.success) throw new ConfigError({ issues: parsed.error.issues });
  return parsed.data;
};
