import { DepthMeasurementDataColumnInternal } from 'domain/wells/measurements/internal/types';
import { isValidDepthMeasurement } from 'domain/wells/measurements/internal/utils/isValidDepthMeasurement';

import convert from 'convert-units';
import { convertPressure } from 'utils/units';

import { DepthMeasurementRow } from '@cognite/sdk-wells';

import { PressureUnit } from 'constants/units';

export const getMeasurementRowValues = ({
  column,
  columnIndex,
  row,
  rowIndex,
  depthUnit,
  pressureUnit,
}: {
  column: DepthMeasurementDataColumnInternal;
  columnIndex: number;
  row: DepthMeasurementRow;
  rowIndex: number;
  depthUnit: convert.Distance;
  pressureUnit: PressureUnit;
}) => {
  const { unit: columnUnit } = column;
  const { depth: depthValue, values } = row;

  let columnValue = values[columnIndex];

  const isValid = isValidDepthMeasurement({
    depthValue,
    columnValue,
    rowIndex,
  });

  /**
   * Return null values if the measurement values are invalid.
   * This helps to breaks the curve as well.
   */
  if (!isValid) {
    return {
      depthValue: null,
      columnValue: null,
    };
  }

  columnValue = convertPressure(
    columnValue,
    columnUnit,
    depthValue,
    depthUnit,
    pressureUnit
  );

  return { depthValue, columnValue };
};
