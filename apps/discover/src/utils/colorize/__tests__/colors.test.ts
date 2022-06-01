import head from 'lodash/head';

import { COLORS } from '../colors';
import { toHashMap } from '../utils/toHashMap';

/**
 * The approved colors should only contain colors with unique hash values.
 * This checks if any hash value is having multiple colors.
 *
 * If this test fails, please slightly modify the color value.
 * If you have any concerns with the colors, please contact Discover Design.
 */
describe('colors', () => {
  it('should only contain colors with unique hash values', () => {
    const colorsHashMap = toHashMap(COLORS);

    Object.values(colorsHashMap).forEach((colorSet) => {
      expect(colorSet).toEqual([head(colorSet)]);
    });
  });
});
