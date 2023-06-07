import * as React from 'react';

import { TimeeriesChartProvider } from './provider';
import { TimeseriesChart as TimeseriesChartComponent } from './TimeseriesChart';
import { TimeseriesChartProps } from './types';

export const TimeseriesChart: React.FC<TimeseriesChartProps> = (props) => {
  return (
    <TimeeriesChartProvider>
      <TimeseriesChartComponent {...props} />
    </TimeeriesChartProvider>
  );
};
