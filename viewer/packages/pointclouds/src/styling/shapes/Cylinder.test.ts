/*!
 * Copyright 2022 Cognite AS
 */

import { Cylinder } from './Cylinder';

describe(Cylinder.name, () => {
  test('constructing cylinder does not throw', () => {
    expect(() => {
      new Cylinder([0, 0, 0], [0, 1, 0], 1);
    }).not.toThrow();
  });

  test('origin is within cylinder at origin', () => {
    const cylinder = new Cylinder([0, -1, 0], [0, 1, 0], 1);

    expect(cylinder.containsPoint([0, 0, 0])).toBeTrue();
  });

  test('origin is outside cylinder away from origin', () => {
    const cylinder = new Cylinder([0, -1, 2], [0, 1, 2], 1);

    expect(cylinder.containsPoint([0, 0, 0])).toBeFalse();
  });
});
