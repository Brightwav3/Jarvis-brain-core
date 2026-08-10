import assert from 'node:assert/strict';
import test from 'node:test';

import { CoreRuntime } from '../src/core/runtime.js';

test('runtime transitions from idle to running and stopped', async () => {
  const runtime = new CoreRuntime({ identity: 'test-runtime' });

  assert.deepEqual(runtime.status(), { identity: 'test-runtime', state: 'idle' });

  await runtime.start();
  assert.deepEqual(runtime.status(), { identity: 'test-runtime', state: 'running' });

  await runtime.stop('test');
  assert.deepEqual(runtime.status(), { identity: 'test-runtime', state: 'stopped' });
});

test('runtime stop is idempotent after shutdown', async () => {
  const runtime = new CoreRuntime({ identity: 'test-runtime' });
  await runtime.start();
  await runtime.stop('first-stop');
  await runtime.stop('second-stop');

  assert.deepEqual(runtime.status(), { identity: 'test-runtime', state: 'stopped' });
});
