import assert from 'node:assert/strict';
import test from 'node:test';
import { HealthService } from '../src/observability/health.js';

test('health is degraded for a failed optional component', () => {
  const health = new HealthService(() => [{ id: 'optional', name: 'Optional', version: '1', required: false, state: 'failed', reason: 'offline' }]).status();
  assert.equal(health.state, 'degraded');
  assert.equal(health.subsystems[0]?.id, 'optional');
});
