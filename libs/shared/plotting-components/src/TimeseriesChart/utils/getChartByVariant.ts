import React from 'react';

import { LineChartProps, Variant } from '../../LineChart';
import { TimeseriesChartLarge } from '../components/TimeseriesChartLarge';
import { TimeseriesChartSmall } from '../components/TimeseriesChartSmall';

export const getChartByVariant = (
  variant: Variant
): React.FC<LineChartProps> => {
  switch (variant) {
    case 'small':
      return TimeseriesChartSmall;

    case 'large':
      return TimeseriesChartLarge;

    default:
      return TimeseriesChartLarge;
  }
};
