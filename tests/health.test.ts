import assert from 'node:assert/strict';
import test from 'node:test';
import { HealthService } from '../src/observability/health.js';

test('health is degraded for a failed optional component', async () => {
  const health = await new HealthService(() => [{ id: 'optional', name: 'Optional', version: '1', required: false, state: 'failed', health: { state: 'unhealthy', reason: 'offline' }, reason: 'offline' }]).status();
  assert.equal(health.state, 'degraded');
  assert.equal(health.subsystems[0]?.id, 'optional');
});

test('health is unhealthy for a failed required component', async () => {
  const health = await new HealthService(() => [{ id: 'required', name: 'Required', version: '1', required: true, state: 'failed', health: { state: 'unhealthy', reason: 'offline' }, reason: 'offline' }]).status();
  assert.equal(health.state, 'unhealthy');
});

test('component-reported degraded health is distinct from lifecycle state', async () => {
  const health = await new HealthService(() => [{ id: 'ready', name: 'Ready', version: '1', required: false, state: 'running', health: { state: 'degraded', reason: 'partial service' } }]).status();
  assert.deepEqual(health, { state: 'degraded', subsystems: [{ id: 'ready', state: 'degraded', reason: 'partial service' }] });
});
