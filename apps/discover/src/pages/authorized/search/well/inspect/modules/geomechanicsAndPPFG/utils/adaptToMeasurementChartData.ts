import compact from 'lodash/compact';

import {
  MeasurementCurveData,
  MeasurementsView,
  MeasurementsViewColumn,
  MeasurementUnits,
} from '../types';

import { getCurveConfig } from './getCurveConfig';
import { getCurveName } from './getCurveName';
import { getCurveValues } from './getCurveValues';
import { isMeasurementTypeFitOrLot } from './isMeasurementTypeFitOrLot';

export const adaptToMeasurementChartData = (
  data: MeasurementsView,
  measurementUnits: MeasurementUnits,
  formatChartData?: ({
    data,
    column,
    curveData,
  }: {
    data: MeasurementsView;
    column: MeasurementsViewColumn;
    curveData: MeasurementCurveData;
  }) => Partial<MeasurementCurveData>
): MeasurementCurveData[] => {
  const { wellboreMatchingId, wellboreName, columns, rows } = data;

  return compact(
    columns.map((column, columnIndex) => {
      const { measurementTypeParent, externalId, isAngle } = column;

      if (!measurementTypeParent) {
        return null;
      }

      const curveValues = getCurveValues({
        column,
        columnIndex,
        rows,
        measurementUnits,
      });

      const curveData: MeasurementCurveData = {
        ...getCurveConfig(column),
        ...curveValues,
        id: `${wellboreMatchingId}-${externalId}`,
        columnExternalId: externalId,
        wellboreName,
        curveName: getCurveName(column),
        measurementType: measurementTypeParent,
        type: 'scatter',
        mode: isMeasurementTypeFitOrLot(measurementTypeParent)
          ? 'markers'
          : 'lines',
        xaxis: isAngle ? 'x2' : 'x',
      };

      return {
        ...curveData,
        ...formatChartData?.({ data, column, curveData }),
      };
    })
  );
};
