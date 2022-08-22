import { DepthMeasurementDataColumnInternal } from 'domain/wells/measurements/internal/types';

import { DepthMeasurementRow } from '@cognite/sdk-wells';

import { PressureUnit } from 'constants/units';

import { getMeasurementRowValues } from './getMeasurementRowValues';

export const getMeasurementCurveCoordinates = ({
  column,
  columnIndex,
  rows,
  depthUnit,
  pressureUnit,
}: {
  column: DepthMeasurementDataColumnInternal;
  columnIndex: number;
  rows: DepthMeasurementRow[];
  depthUnit: convert.Distance;
  pressureUnit: PressureUnit;
}) => {
  return rows.reduce(
    ({ x, y }, row, rowIndex) => {
      const { depthValue, columnValue } = getMeasurementRowValues({
        column,
        columnIndex,
        row,
        rowIndex,
        depthUnit,
        pressureUnit,
      });

      return {
        x: [...x, columnValue],
        y: [...y, depthValue],
      };
    },
    { x: [], y: [] } as { x: (number | null)[]; y: (number | null)[] }
  );
};
