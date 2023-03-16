import * as React from 'react';

import { LineChart, LineChartProps } from '../../../LineChart';

import { CONFIG, LAYOUT } from './constants';
import { formatHoverLineInfo } from './helpers/formatHoverLineInfo';
import { formatTooltipContent } from './helpers/formatTooltipContent';

export const TimeseriesChartLarge: React.FC<LineChartProps> = (props) => {
  return (
    <LineChart
      {...props}
      variant="large"
      layout={LAYOUT}
      config={CONFIG}
      formatTooltipContent={formatTooltipContent}
      formatHoverLineInfo={formatHoverLineInfo}
    />
  );
};
