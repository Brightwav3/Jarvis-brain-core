import assert from 'node:assert/strict';
import test from 'node:test';

import { ConfigError, loadConfig } from '../src/core/config.js';

test('configuration applies environment overrides', () => {
  assert.deepEqual(
    loadConfig({ RUNTIME_IDENTITY: 'unit', RUNTIME_API_HOST: '127.0.0.2', RUNTIME_API_PORT: '4311', RUNTIME_LOG_LEVEL: 'debug' }),
    { identity: 'unit', api: { host: '127.0.0.2', port: 4311 }, log: { level: 'debug' } },
  );
});

test('configuration rejects an invalid port with a typed error', () => {
  assert.throws(() => loadConfig({ RUNTIME_API_PORT: '70000' }), (error: unknown) =>
    error instanceof ConfigError && error.code === 'CONFIG_INVALID',
  );
});
