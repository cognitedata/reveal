import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import compact from 'lodash/compact';
import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import uniqueId from 'lodash/uniqueId';
import uniqWith from 'lodash/uniqWith';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';
import { sortObjectsAscending } from 'utils/sort';

import { MudWeightData } from '../types';

import { isEqualMudWeights } from './isEqualMudWeights';

export const adaptDepthMeasurementToMudWeights = (
  depthMeasurement: DepthMeasurementWithData
): Array<MudWeightData> => {
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
            value: isNumber(columnValue)
              ? toFixedNumberFromNumber(columnValue, Fixed.TwoDecimals)
              : columnValue,
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
