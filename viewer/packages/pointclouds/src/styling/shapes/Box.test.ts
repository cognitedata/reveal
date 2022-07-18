/*!
 * Copyright 2022 Cognite AS
 */

import { Box } from './Box';
import { Mat4 } from './linalg';

function createIdentityMatrix(): Mat4 {
  const arr = new Array<number>(16);
  for (let i = 0; i < 16; i++) {
    // Set every element on the diagonal to 1,
    // all others to 0
    arr[i] = i % 5 == 0 ? 1 : 0;
  }

  return { data: arr };
}

describe(Box.name, () => {
  test('constructing box does not throw error', () => {
    expect(() => {
      new Box(createIdentityMatrix());
    }).not.toThrow();
  });

  test('origin is within identity box', () => {
    const box = new Box(createIdentityMatrix());

    expect(box.containsPoint([0, 0, 0])).toBeTrue();
  });

  test('point [1, 1, 1] is not within identity box', () => {
    const box = new Box(createIdentityMatrix());

    expect(box.containsPoint([1, 1, 1])).toBeFalse();
  });
});
