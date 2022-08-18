import React from 'react';

import { MeasurementsChart } from '../../components/MeasurementsChart';
import { MeasurementCurveData, MeasurementUnits } from '../../types';
import { ChartLegend } from '../ChartLegend';

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
  return (
    <ChartWrapper data-testid="compare-view-chart">
      <MeasurementsChart
        data={data}
        title={title}
        measurementUnits={measurementUnits}
      />

      <ChartLegend
        data={data}
        formatCustomData={({ wellboreName }) => [wellboreName]}
      />
    </ChartWrapper>
  );
};
