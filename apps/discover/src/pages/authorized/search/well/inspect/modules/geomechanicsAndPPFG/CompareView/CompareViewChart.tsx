import { MeasurementCurveData } from 'domain/wells/measurements/internal/types';

import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { ChartLegend } from '../components/ChartLegend';
import { MeasurementsChart } from '../components/MeasurementsChart';
import { MeasurementUnits } from '../types';

import { ChartWrapper } from './elements';

export interface CompareViewChartProps {
  title: string;
  data: MeasurementCurveData[];
  measurementUnits: MeasurementUnits;
}

export const CompareViewChart: React.FC<CompareViewChartProps> = ({
  title,
  data,
  measurementUnits,
}) => {
  if (isEmpty(data)) {
    return null;
  }

  return (
    <ChartWrapper data-testid="compare-view-chart">
      <MeasurementsChart
        data={data}
        title={title}
        measurementUnits={measurementUnits}
      />

      <ChartLegend data={data} />
    </ChartWrapper>
  );
};
