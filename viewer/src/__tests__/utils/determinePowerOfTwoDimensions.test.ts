/*!
 * Copyright 2020 Cognite AS
 */

import { determinePowerOfTwoDimensions } from '../../utilities/determinePowerOfTwoDimensions';

test('determinePowerOfTwoDimensions', () => {
  expect(determinePowerOfTwoDimensions(0)).toEqual({ width: 1, height: 1 });
  expect(determinePowerOfTwoDimensions(1)).toEqual({ width: 1, height: 1 });
  expect(determinePowerOfTwoDimensions(2)).toEqual({ width: 2, height: 1 });
  expect(determinePowerOfTwoDimensions(3)).toEqual({ width: 2, height: 2 });
  expect(determinePowerOfTwoDimensions(1025)).toEqual({ width: 64, height: 32 });
  expect(determinePowerOfTwoDimensions(2048)).toEqual({ width: 64, height: 32 });
  expect(determinePowerOfTwoDimensions(2049)).toEqual({ width: 64, height: 64 });
  expect(determinePowerOfTwoDimensions(4096 * 4096 - 1)).toEqual({ width: 4096, height: 4096 });
});
