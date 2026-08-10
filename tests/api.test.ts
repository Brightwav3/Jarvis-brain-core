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

test('local API rejects non-GET methods with a typed 405 response', async () => {
  const api = new LocalApiServer({ identity: 'unit', version: '1.0.0', status: () => ({ identity: 'unit', state: 'running' }), components: () => [] });
  const address = await api.start(0);
  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/status`, { method: 'POST' });
    assert.equal(response.status, 405);
    assert.deepEqual(await response.json(), { ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed', context: { method: 'POST' }, remediation: 'Use GET for this endpoint' } });
  } finally { await api.stop(); }
});
