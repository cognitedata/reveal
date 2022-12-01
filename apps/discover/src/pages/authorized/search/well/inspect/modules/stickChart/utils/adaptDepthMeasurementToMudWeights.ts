import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';
import { WdlMeasurementType } from 'domain/wells/measurements/service/types';

import isNumber from 'lodash/isNumber';
import uniqueId from 'lodash/uniqueId';
import { includesAll } from 'utils/filter/includesAll';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';

import { MudWeightData } from '../types';

export const adaptDepthMeasurementToMudWeights = (
  depthMeasurement: DepthMeasurementWithData
): Array<MudWeightData> => {
  const { columns, rows, depthUnit } = depthMeasurement;

  let mudTypeColumnIndex: number;
  let minMudDensityColumnIndex: number;
  let maxMudDensityColumnIndex: number;

  columns.forEach(({ externalId, measurementType }, index) => {
    if (measurementType.includes(WdlMeasurementType.MUD_TYPE)) {
      mudTypeColumnIndex = index;
    } else if (includesAll(externalId, ['min', 'density'])) {
      minMudDensityColumnIndex = index;
    } else if (includesAll(externalId, ['max', 'density'])) {
      maxMudDensityColumnIndex = index;
    }
  });

  return rows.map(({ depth, values }) => {
    return {
      id: uniqueId('mud-weight-'),
      type: values[mudTypeColumnIndex],
      depth,
      minMudDensity: getColumnValue(values[minMudDensityColumnIndex]),
      maxMudDensity: getColumnValue(values[maxMudDensityColumnIndex]),
      depthUnit,
      densityUnit: columns[minMudDensityColumnIndex].unit,
    };
  });
};

const getColumnValue = <T extends string | number>(columnValue?: T) => {
  if (isNumber(columnValue)) {
    return toFixedNumberFromNumber(columnValue, Fixed.TwoDecimals);
  }
  return columnValue;
};
