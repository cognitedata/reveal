/*!
 * Copyright 2020 Cognite AS
 */

import { determineTextureDimensions } from '../../utils/determinePowerOfTwoDimensions';

test('determinePowerOfTwoDimensions', () => {
  expect(determineTextureDimensions(0)).toEqual({ width: 1, height: 1 });
  expect(determineTextureDimensions(1)).toEqual({ width: 1, height: 1 });
  expect(determineTextureDimensions(2)).toEqual({ width: 2, height: 1 });
  expect(determineTextureDimensions(3)).toEqual({ width: 2, height: 2 });
  expect(determineTextureDimensions(1025)).toEqual({ width: 64, height: 32 });
  expect(determineTextureDimensions(2048)).toEqual({ width: 64, height: 32 });
  expect(determineTextureDimensions(2049)).toEqual({ width: 64, height: 64 });
  expect(determineTextureDimensions(4096 * 4096 - 1)).toEqual({ width: 4096, height: 4096 });
});
