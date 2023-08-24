import * as React from 'react';
import { useMemo } from 'react';

import { LineChart, LineChartProps } from '../../../LineChart';
import { useTranslation } from '../../../useTranslation';
import { TimeseriesChartMetadata } from '../../domain/internal/types';
import { getChartAxisDisplayUnit } from '../../utils/getChartAxisDisplayUnit';

import { CONFIG, LAYOUT } from './constants';
import { formatTooltipContent } from './helpers/formatTooltipContent';

export interface TimeseriesChartSmallProps extends LineChartProps {
  metadata: TimeseriesChartMetadata[];
}

export const TimeseriesChartSmall: React.FC<TimeseriesChartSmallProps> = ({
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
      variant="small"
      layout={LAYOUT}
      config={CONFIG}
      formatTooltipContent={(tooltipProps) =>
        formatTooltipContent(tooltipProps, unit, t)
      }
    />
  );
};
