import * as React from 'react';

import { TimeseriesChart as TimeseriesChartComponent } from './TimeseriesChart';
import { TimeeriesChartProvider } from './provider';
import { TimeseriesChartProps } from './types';

export const TimeseriesChart: React.FC<TimeseriesChartProps> = (props) => {
  return (
    <TimeeriesChartProvider>
      <TimeseriesChartComponent {...props} />
    </TimeeriesChartProvider>
  );
};
