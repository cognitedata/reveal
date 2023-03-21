import * as React from 'react';

import { LineChart, LineChartProps } from '../../../LineChart';

import { CONFIG, LAYOUT } from './constants';
import { formatTooltipContent } from './helpers/formatTooltipContent';

export const TimeseriesChartSmall: React.FC<LineChartProps> = (props) => {
  return (
    <LineChart
      {...props}
      variant="small"
      layout={LAYOUT}
      config={CONFIG}
      formatTooltipContent={formatTooltipContent}
    />
  );
};
