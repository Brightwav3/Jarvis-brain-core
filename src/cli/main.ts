import { createOk } from '../core/contracts.js';
import { CoreRuntime } from '../core/runtime.js';

const identity = process.env.RUNTIME_IDENTITY ?? 'core-runtime';

const write = (value: unknown): void => {
  process.stdout.write(`${JSON.stringify(value)}\n`);
};

const runForeground = async (): Promise<void> => {
  const runtime = new CoreRuntime({ identity });
  await runtime.start();
  write(createOk(runtime.status()));

  let finish: (() => void) | undefined;
  const stopped = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const keepAlive = setInterval(() => undefined, 2_147_483_647);

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    process.off('SIGINT', onSigint);
    process.off('SIGTERM', onSigterm);
    await runtime.stop(signal);
    write(createOk(runtime.status()));
    process.exitCode = 0;
    clearInterval(keepAlive);
    finish?.();
  };
  const onSigint = (): void => { void shutdown('SIGINT'); };
  const onSigterm = (): void => { void shutdown('SIGTERM'); };

  process.once('SIGINT', onSigint);
  process.once('SIGTERM', onSigterm);
  await stopped;
};

const command = process.argv[2];
if (command === 'start') {
  void runForeground();
} else {
  write({ ok: false, error: { code: 'COMMAND_INVALID', message: 'Expected the start command', context: { command }, remediation: 'Run the executable with start' } });
  process.exitCode = 2;
}
