import { scaleQuantize } from 'd3-scale';
import difference from 'lodash/difference';
import uniq from 'lodash/uniq';

import { COLORS } from './colors';
import { ColorMap } from './types';
import { getHashMapReverse } from './utils/getHashMapReverse';
import { getHashValuesFromHashMap } from './utils/getHashValuesFromHashMap';
import { toHashMap } from './utils/toHashMap';
import { toHashMapUnique } from './utils/toHashMapUnique';

export const colorize = (
  properties: string[],
  propertyColorOverride: ColorMap = {},
  colors: string[] = COLORS
): ColorMap => {
  const propertiesToProcess = difference(
    uniq(properties),
    Object.keys(propertyColorOverride)
  );

  const propertiesHashMap = toHashMap(propertiesToProcess);
  const propertiesHashMapReverse = getHashMapReverse(propertiesHashMap);

  const colorsHashMap = toHashMapUnique(colors);
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

  const colorMap = propertiesToProcess.reduce<ColorMap>((map, property) => {
    // Get the hash value of the property.
    const propertyHash = propertiesHashMapReverse[property];

    // Get the color scale value (in the common scale) for the above property hash value.
    const colorScaleValue = propertyHashScale(propertyHash);

    // Get the color hash value for the above common scale value.
    const colorHash = colorHashScale(colorScaleValue);

    // Get the actual color.
    const color = colorsHashMap[colorHash];

    return {
      ...map,
      [property]: color,
    };
  }, {});

  return {
    ...colorMap,
    ...propertyColorOverride,
  };
};
