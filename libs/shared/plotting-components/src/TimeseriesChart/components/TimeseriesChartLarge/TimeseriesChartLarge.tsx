import * as React from 'react';
import { useMemo } from 'react';

import { LineChart, LineChartProps } from '../../../LineChart';
import { useTranslation } from '../../../useTranslation';
import { TimeseriesChartMetadata } from '../../domain/internal/types';
import { getChartAxisDisplayUnit } from '../../utils/getChartAxisDisplayUnit';

import { CONFIG, LAYOUT } from './constants';
import { formatHoverLineInfo } from './helpers/formatHoverLineInfo';
import { formatTooltipContent } from './helpers/formatTooltipContent';

export interface TimeseriesChartLargeProps extends LineChartProps {
  metadata: TimeseriesChartMetadata[];
}

export const TimeseriesChartLarge: React.FC<TimeseriesChartLargeProps> = ({
  metadata,
  ...props
}) => {
  const { t } = useTranslation();

  const unit = useMemo(() => {
    return getChartAxisDisplayUnit(metadata);
  }, [metadata]);

  return (
    <LineChart
      {...props}
      variant="large"
      yAxis={{
        name: unit,
      }}
      layout={LAYOUT}
      config={CONFIG}
      formatTooltipContent={(tooltipProps) =>
        formatTooltipContent(tooltipProps, unit, t)
      }
      formatHoverLineInfo={formatHoverLineInfo}
    />
  );
};
