import * as React from 'react';

import { LineChart } from '../LineChart';

import { useTimerseriesQuery } from './hooks/useTimerseriesQuery';
import { TimeseriesChartProps } from './types';

export const TimeseriesChart: React.FC<TimeseriesChartProps> = ({
  timeseriesId,
  dateRange,
  style,
}) => {
  const { data } = useTimerseriesQuery({
    timeseriesId,
    start: dateRange?.[0],
    end: dateRange?.[1],
  });

  if (!data) {
    return null;
  }

  return (
    <LineChart
      data={data}
      layout={{
        showLegend: false,
      }}
      style={style}
    />
  );
};
