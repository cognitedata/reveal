/*!
 * Copyright 2026 Cognite AS
 */

import { PickCacheInvalidator } from './PickCacheInvalidator';

describe(PickCacheInvalidator.name, () => {
  test('is not requested initially', () => {
    expect(new PickCacheInvalidator().consume()).toBe(false);
  });

  test('consume returns true once after a request, then clears', () => {
    const invalidation = new PickCacheInvalidator();

    invalidation.request();
    invalidation.request();

    expect(invalidation.consume()).toBe(true);
    expect(invalidation.consume()).toBe(false);
  });
});
