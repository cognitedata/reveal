import * as React from 'react';

import { LineChart, LineChartProps } from '../../../LineChart';
import { TimeseriesChartMetadata } from '../../domain/internal/types';

import { CONFIG, LAYOUT } from './constants';
import { formatHoverLineInfo } from './helpers/formatHoverLineInfo';
import { formatTooltipContent } from './helpers/formatTooltipContent';

export interface TimeseriesChartLargeProps extends LineChartProps {
  metadata: TimeseriesChartMetadata;
}

export const TimeseriesChartLarge: React.FC<TimeseriesChartLargeProps> = ({
  metadata,
  ...props
}) => {
  return (
    <LineChart
      {...props}
      variant="large"
      layout={{
        ...LAYOUT,
        showMarkers: metadata.dataFetchMode === 'raw',
      }}
      config={CONFIG}
      formatTooltipContent={formatTooltipContent}
      formatHoverLineInfo={formatHoverLineInfo}
    />
  );
};
