import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import compact from 'lodash/compact';
import isNil from 'lodash/isNil';
import uniqueId from 'lodash/uniqueId';
import uniqWith from 'lodash/uniqWith';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';
import { sortObjectsAscending } from 'utils/sort';

import { MudWeight } from '../types';

import { isEqualMudWeights } from './isEqualMudWeights';

export const adaptDepthMeasurementToMudWeight = (
  depthMeasurement: DepthMeasurementWithData
): Array<MudWeight> => {
  const { columns, rows, depthUnit } = depthMeasurement;

  const mudWeights = columns.flatMap(
    ({ name, measurementType, unit: columnUnit }, columnIndex) => {
      return compact(
        rows.map(({ depth: depthValue, values }) => {
          const columnValue = values[columnIndex];

          if (isNil(columnValue)) {
            return null;
          }

          const type = name || measurementType;

          const value = {
            value: toFixedNumberFromNumber(columnValue, Fixed.TwoDecimals),
            unit: columnUnit,
          };

          const depth = {
            value: toFixedNumberFromNumber(depthValue, Fixed.TwoDecimals),
            unit: depthUnit,
          };

          return {
            id: uniqueId(`${depthValue}-${columnValue}-`),
            type,
            value,
            depth,
          };
        })
      );
    }
  );

  const uniqMudWeights = uniqWith(mudWeights, isEqualMudWeights);

  const sortedMudWeights = sortObjectsAscending(uniqMudWeights, 'value.value');

  return sortedMudWeights;
};
