/*!
 * Copyright 2020 Cognite AS
 */

import { createOffsets } from '../../utilities/arrayUtils';
import 'jest-extended';

describe('createOffsets', () => {
  test('empty array, returns empty', () => {
    const result = createOffsets(new Float64Array(0));
    expect(result).toBeEmpty();
  });

  test('three elements, returns correct result', () => {
    const original = new Float64Array([1, 5, 7]);
    const result = createOffsets(original);
    expect(result).toContainAllValues([0, 1, 6]);
  });
});
