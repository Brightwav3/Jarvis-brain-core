import { createError, createOk } from '../core/contracts.js';
import { loadConfig } from '../core/config.js';
import { CoreRuntime } from '../core/runtime.js';
import { createExampleComponent } from '../components/example-component.js';

const write = (value: unknown): void => { process.stdout.write(`${JSON.stringify(value)}\n`); };

const runForeground = async (): Promise<void> => {
  const config = loadConfig(process.env);
  const runtime = new CoreRuntime({ identity: config.identity, api: { host: config.api.host, port: config.api.port, version: process.env.RUNTIME_VERSION ?? '0.1.0' }, components: [createExampleComponent()] });
  await runtime.start();
  write(createOk(runtime.status()));
  let finish: (() => void) | undefined;
  const stopped = new Promise<void>((resolve) => { finish = resolve; });
  const keepAlive = setInterval(() => undefined, 2_147_483_647);
  const shutdown = async (signal: NodeJS.Signals): Promise<void> => { process.off('SIGINT', onSigint); process.off('SIGTERM', onSigterm); await runtime.stop(signal); write(createOk(runtime.status())); clearInterval(keepAlive); finish?.(); };
  const onSigint = (): void => { void shutdown('SIGINT'); };
  const onSigterm = (): void => { void shutdown('SIGTERM'); };
  process.once('SIGINT', onSigint); process.once('SIGTERM', onSigterm); await stopped;
};

const query = async (path: 'status' | 'health'): Promise<void> => {
  const config = loadConfig(process.env);
  try { write(await (await fetch(`http://${config.api.host}:${config.api.port}/${path}`)).json()); }
  catch { write(createError('LOCAL_API_UNAVAILABLE', 'Local API is unavailable', { host: config.api.host, port: config.api.port }, 'Start the runtime first')); process.exitCode = 2; }
};

const command = process.argv[2];
const action = command === 'start' ? runForeground() : command === 'status' || command === 'health' ? query(command) : Promise.resolve().then(() => { write(createError('COMMAND_INVALID', 'Invalid command', { command }, 'Use start, status, or health')); process.exitCode = 2; });
void action.catch((error: unknown) => { write(createError('RUNTIME_FAILED', 'Runtime command failed', { error: error instanceof Error ? error.message : String(error) }, 'Inspect configuration and retry')); process.exitCode = 1; });
