import { MeasurementsView, MeasurementUnits } from '../types';

import { adaptToMeasurementChartData } from './adaptToMeasurementChartData';

export const adaptToChartDataCurveCentricView = (
  data: MeasurementsView,
  measurementUnits: MeasurementUnits
) => {
  return adaptToMeasurementChartData(
    data,
    measurementUnits,
    ({ data, curveData }) => {
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
    }
  );
};
