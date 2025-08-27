import { describe, expect, test } from 'vitest';

import { toIdEither } from './toIdEither';

describe(toIdEither.name, () => {
  test('converts internal id to IdEither', () => {
    expect(toIdEither(123)).toEqual({ id: 123 });
  });

  test('converts external id to IdEither', () => {
    expect(toIdEither('some-external-id')).toEqual({ externalId: 'some-external-id' });
  });
});
