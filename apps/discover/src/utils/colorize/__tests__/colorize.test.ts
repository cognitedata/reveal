import times from 'lodash/times';

import { colorize as _colorize } from '../colorize';
import { ColorMap } from '../types';

const TEST_COLORS = times(40).map((index) => `color-${index}`);

/**
 * This is to decouple the unit tests from the defined colors.
 */
const colorize = (properties: string[], propertyColorOverride: ColorMap = {}) =>
  _colorize(properties, propertyColorOverride, TEST_COLORS);

describe('colorize', () => {
  const compareColorizedResults = (
    colorizedResult1: ColorMap,
    colorizedResult2: ColorMap,
    properties: string[]
  ) => {
    properties.forEach((property) => {
      const value1 = colorizedResult1[property];
      const value2 = colorizedResult2[property];
      expect(value1).toEqual(value2);
    });
  };

  it('should colorize the properties', () => {
    const colorizedResult = colorize(['A', 'B', 'C', 'D']);

    expect(colorizedResult).toEqual({
      A: 'color-34',
      B: 'color-25',
      C: 'color-16',
      D: 'color-35',
    });
  });

  it('should colorize the same regardless the property order', () => {
    const colorizedResult = colorize(['A', 'B', 'C', 'D']);

    expect(colorize(['D', 'C', 'B', 'A'])).toEqual(colorizedResult);
    expect(colorize(['D', 'B', 'C', 'A'])).toEqual(colorizedResult);
    expect(colorize(['A', 'C', 'D', 'B'])).toEqual(colorizedResult);
    expect(colorize(['D', 'A', 'B', 'C'])).toEqual(colorizedResult);
  });

  it('should persist the color for same hash value', () => {
    const colorizedResult1 = colorize(['A', 'B', 'C', 'D']);
    const colorizedResult2 = colorize(['A', 'C', 'D']);

    const propertiesToCompare = ['A', 'C', 'D'];
    compareColorizedResults(
      colorizedResult1,
      colorizedResult2,
      propertiesToCompare
    );
  });

  it('should persist the color for same hash value when order is changed', () => {
    const colorizedResult1 = colorize(['B', 'A', 'C', 'D']);
    const colorizedResult2 = colorize(['C', 'D', 'B']);

    const propertiesToCompare = ['B', 'C', 'D'];
    compareColorizedResults(
      colorizedResult1,
      colorizedResult2,
      propertiesToCompare
    );
  });

  it('should work same for duplicate properties', () => {
    expect(colorize(['A', 'A', 'B', 'C', 'D'])).toEqual(
      colorize(['A', 'B', 'C', 'D'])
    );
  });

  it('should override colors properly', () => {
    const overriddenColor = 'overridden-color';

    const colorizedResultWithOverrride = colorize(['A', 'B', 'C', 'D'], {
      A: overriddenColor,
    });
    const colorizedResultWithoutOverrride = colorize(['A', 'B', 'C', 'D']);

    expect(colorizedResultWithOverrride.A).toEqual(overriddenColor);

    const propertiesToCompare = ['B', 'C', 'D'];
    compareColorizedResults(
      colorizedResultWithOverrride,
      colorizedResultWithoutOverrride,
      propertiesToCompare
    );
  });

  it('should return the same color when passed as a single property', () => {
    const properties = ['A', 'B', 'C', 'D'];
    const allPropertiesColorizedResult = colorize(properties);

    properties.forEach((property) => {
      const singlePropertyColorizedResult = colorize([property]);

      compareColorizedResults(
        allPropertiesColorizedResult,
        singlePropertyColorizedResult,
        [property]
      );
    });
  });
});
