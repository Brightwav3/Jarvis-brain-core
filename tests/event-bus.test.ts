import assert from 'node:assert/strict';
import test from 'node:test';
import { EventBus } from '../src/events/event-bus.js';

test('event bus delivers typed events and unsubscribe stops delivery', async () => {
  const bus = new EventBus();
  const seen: string[] = [];
  const unsubscribe = bus.subscribe('core.started', (event) => { seen.push(event.type); });
  await bus.publish({ type: 'core.started', source: 'test', timestamp: '2026-08-10T00:00:00.000Z' });
  unsubscribe();
  await bus.publish({ type: 'core.started', source: 'test', timestamp: '2026-08-10T00:00:01.000Z' });
  assert.deepEqual(seen, ['core.started']);
});

test('event bus isolates subscriber failure and reports a structured delivery failure', async () => {
  const failures: Array<{ eventType: string; error: string }> = [];
  const bus = new EventBus((failure) => failures.push(failure));
  bus.subscribe('component.failed', async () => { throw new Error('subscriber unavailable'); });
  await bus.publish({ type: 'component.failed', source: 'component-a', timestamp: '2026-08-10T00:00:00.000Z', componentId: 'component-a', error: 'startup failed' });
  assert.deepEqual(failures, [{ eventType: 'component.failed', error: 'subscriber unavailable' }]);
});
