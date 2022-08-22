import compact from 'lodash/compact';

import { PressureUnit } from 'constants/units';

import { getMeasurementCurveConfig } from '../selectors/getMeasurementCurveConfig';
import { getMeasurementCurveCoordinates } from '../selectors/getMeasurementCurveCoordinates';
import { getMeasurementCurveName } from '../selectors/getMeasurementCurveName';
import {
  DepthMeasurementWithData,
  MeasurementCurveData,
  MeasurementCurveFormatterData,
} from '../types';
import { isMeasurementTypeFitOrLot } from '../utils/isMeasurementTypeFitOrLot';

export const adaptToMeasurementChartData = <T extends DepthMeasurementWithData>(
  data: T,
  pressureUnit: PressureUnit,
  formatCurveData?: ({
    data,
    column,
    curveData,
  }: MeasurementCurveFormatterData<T>) => Partial<MeasurementCurveData>
): MeasurementCurveData[] => {
  const { wellboreMatchingId, depthColumn, columns, rows } = data;
  const { unit: depthUnit } = depthColumn;

  return compact(
    columns.map((column, columnIndex) => {
      const { measurementTypeParent, externalId, isAngle } = column;

      if (!measurementTypeParent) {
        return null;
      }

      const curveCoordinates = getMeasurementCurveCoordinates({
        column,
        columnIndex,
        rows,
        depthUnit,
        pressureUnit,
      });

      const curveData: MeasurementCurveData = {
        ...getMeasurementCurveConfig(column),
        ...curveCoordinates,
        id: `${wellboreMatchingId}-${externalId}`,
        columnExternalId: externalId,
        curveName: getMeasurementCurveName(column),
        measurementTypeParent,
        type: 'scatter',
        mode: isMeasurementTypeFitOrLot(measurementTypeParent)
          ? 'markers'
          : 'lines',
        xaxis: isAngle ? 'x2' : 'x',
        customdata: [],
      };

      return {
        ...curveData,
        ...formatCurveData?.({ data, column, curveData }),
      };
    })
  );
};
