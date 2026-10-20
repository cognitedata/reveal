/*!
 * Copyright 2026 Cognite AS
 */

import { PickCacheInvalidation } from './PickCacheInvalidation';

describe(PickCacheInvalidation.name, () => {
  test('is not requested initially', () => {
    expect(new PickCacheInvalidation().consume()).toBe(false);
  });

  test('consume returns true once after a request, then clears', () => {
    const invalidation = new PickCacheInvalidation();

    invalidation.request();
    invalidation.request();

    expect(invalidation.consume()).toBe(true);
    expect(invalidation.consume()).toBe(false);
  });
});
