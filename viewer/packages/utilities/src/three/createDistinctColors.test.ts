/*!
 * Copyright 2022 Cognite AS
 */

import { createDistinctColors } from './createDistinctColors';

import { Vector3 } from 'three';

describe('createDistinctColors', () => {
  test('creates somewhat distinct colors', () => {
    const minDifference = 0.15;
    const count = 20;

    const colors = createDistinctColors(count);

    expect(colors).toHaveLength(count);

    colors.forEach((c0, i0) => {
      colors.forEach((c1, i1) => {
        if (i1 <= i0) {
          // Ensure each pair is only considered once
          return;
        }

        const dist = new Vector3().fromArray(c0.toArray()).distanceTo(new Vector3().fromArray(c1.toArray()));

        expect(dist).toBeGreaterThan(minDifference);
      });
    });
  });
});
