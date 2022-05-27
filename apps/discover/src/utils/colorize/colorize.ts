import { scaleQuantize } from 'd3-scale';
import sortedUniq from 'lodash/sortedUniq';

import { COLORS } from './colors';
import { ColorMap } from './types';
import { getHashValuesFromHashMap } from './utils/getHashValuesFromHashMap';
import { toHashMap } from './utils/toHashMap';

export const colorize = (
  properties: string[],
  propertyColorOverride: ColorMap = {},
  colors: string[] = COLORS
): ColorMap => {
  const propertiesSorted = sortedUniq(properties);

  const propertiesHashMap = toHashMap(propertiesSorted);
  const propertiesHashValues = getHashValuesFromHashMap(propertiesHashMap);

  const colorsHashMap = toHashMap(colors);
  const colorsHashValues = getHashValuesFromHashMap(colorsHashMap);

  /**
   * The common scale that we spread the properties and colors.
   * This common scale acts like an interface that helps
   * to map the property hash value and the color hash value.
   */
  const colorizeScaleBounds = [0, colors.length - 1 || 0];

  const propertyHashScale = (propertyHash: number) => {
    return propertyHash % (colorizeScaleBounds[1] + 1);
  };

  const colorHashScale = scaleQuantize()
    .domain(colorizeScaleBounds)
    .range(colorsHashValues);

  const colorMap = propertiesHashValues.reduce<ColorMap>(
    (map, propertyHash) => {
      /**
       * Here we get the common scale value for a particular property hash value,
       * then get the corresponding color hash value for that common scale value.
       *
       * This builds a mapping between the property hash value and the color hash value.
       */
      const colorScaleValue = propertyHashScale(propertyHash);
      const colorHash = colorHashScale(colorScaleValue);

      // Get the actual values for hash values.
      const property = propertiesHashMap[propertyHash];
      const color = colorsHashMap[colorHash];

      return {
        ...map,
        [property]: color,
      };
    },
    {}
  );

  return {
    ...colorMap,
    ...propertyColorOverride,
  };
};
