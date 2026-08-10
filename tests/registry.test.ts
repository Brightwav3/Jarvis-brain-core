import assert from 'node:assert/strict';
import test from 'node:test';
import { ComponentRegistry } from '../src/components/registry.js';
import { EventBus } from '../src/events/event-bus.js';

test('optional component failure is isolated and recorded', async () => {
  const registry = new ComponentRegistry(new EventBus());
  registry.register({ id: 'required', name: 'Required', version: '1.0.0', required: true, start: async () => undefined, stop: async () => undefined, health: () => ({ state: 'healthy' }) });
  registry.register({ id: 'optional', name: 'Optional', version: '1.0.0', required: false, start: async () => { throw new Error('unavailable'); }, stop: async () => undefined, health: () => ({ state: 'healthy' }) });
  await registry.startAll();
  assert.deepEqual(registry.list().map(({ id, state }) => ({ id, state })), [{ id: 'required', state: 'running' }, { id: 'optional', state: 'failed' }]);
});
