import assert from 'node:assert/strict';
import test from 'node:test';
import { LocalApiServer } from '../src/api/server.js';

test('local API serves a JSON health envelope', async () => {
  const api = new LocalApiServer({ identity: 'unit', version: '1.0.0', status: () => ({ identity: 'unit', state: 'running' }), components: () => [] });
  const address = await api.start(0);
  const response = await fetch(`http://127.0.0.1:${address.port}/health`);
  assert.deepEqual(await response.json(), { ok: true, data: { state: 'healthy', subsystems: [] } });
  await api.stop();
});
