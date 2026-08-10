import assert from 'node:assert/strict';
import test from 'node:test';

import { createError, createOk } from '../src/core/contracts.js';

test('contract helpers emit stable success and error envelopes', () => {
  assert.deepEqual(createOk({ value: 1 }), {
    ok: true,
    data: { value: 1 },
  });

  assert.deepEqual(
    createError('CONFIG_INVALID', 'Invalid configuration', {}, 'Set a valid port'),
    {
      ok: false,
      error: {
        code: 'CONFIG_INVALID',
        message: 'Invalid configuration',
        context: {},
        remediation: 'Set a valid port',
      },
    },
  );
});
