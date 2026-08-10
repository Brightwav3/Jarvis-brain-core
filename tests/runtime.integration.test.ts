import assert from 'node:assert/strict';
import test from 'node:test';
import { CoreRuntime } from '../src/core/runtime.js';

test('runtime owns API lifecycle and reports a failed optional component as degraded', async () => {
  const runtime = new CoreRuntime({
    identity: 'integration',
    api: { host: '127.0.0.1', port: 0, version: '1.0.0' },
    components: [{ id: 'optional', name: 'Optional', version: '1', required: false, start: async () => { throw new Error('offline'); }, stop: async () => undefined, health: () => ({ state: 'healthy' }) }],
  });
  await runtime.start();
  const status = runtime.status();
  assert.equal(status.state, 'running');
  const response = await fetch(`http://127.0.0.1:${status.api?.port}/health`);
  assert.deepEqual(await response.json(), { ok: true, data: { state: 'degraded', subsystems: [{ id: 'optional', state: 'degraded', reason: 'offline' }] } });
  await runtime.stop('test');
  assert.equal(runtime.status().state, 'stopped');
});
