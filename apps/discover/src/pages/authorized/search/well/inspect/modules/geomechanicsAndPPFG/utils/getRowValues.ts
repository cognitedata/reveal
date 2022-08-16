import { isValidDepthMeasurement } from 'domain/wells/measurements/internal/utils/isValidDepthMeasurement';

import { convertPressure } from 'utils/units';

import { DepthMeasurementRow } from '@cognite/sdk-wells';

import { MeasurementsViewColumn, MeasurementUnits } from '../types';

export const getRowValues = ({
  column,
  columnIndex,
  row,
  rowIndex,
  measurementUnits,
}: {
  column: MeasurementsViewColumn;
  columnIndex: number;
  row: DepthMeasurementRow;
  rowIndex: number;
  measurementUnits: MeasurementUnits;
}) => {
  const { unit: columnUnit } = column;
  const { depth: depthValue, values } = row;
  const { pressureUnit, depthUnit } = measurementUnits;

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
