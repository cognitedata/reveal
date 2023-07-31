import { adaptToMeasurementChartData } from 'domain/wells/measurements/internal/transformers/adaptToMeasurementChartData';

import { PressureUnit } from 'constants/units';

import { MeasurementsView } from '../types';

export const adaptToChartDataCurveCentricView = (
  data: MeasurementsView,
  pressureUnit: PressureUnit
) => {
  return adaptToMeasurementChartData(data, pressureUnit, ({ curveData }) => {
    const { wellName, wellboreName, wellboreColor } = data;
    const { line = {}, marker = {} } = curveData;

    return {
      line: {
        ...line,
        color: wellboreColor,
      },
      marker: {
        ...marker,
        color: wellboreColor,
        line: {
          ...(marker.line || {}),
          color: wellboreColor,
        },
      },
      customdata: [wellName, wellboreName],
    };
  });
};
