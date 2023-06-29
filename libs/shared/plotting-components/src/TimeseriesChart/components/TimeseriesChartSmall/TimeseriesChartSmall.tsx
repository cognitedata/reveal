import * as React from 'react';
import { useMemo } from 'react';

import { Data, LineChart, LineChartProps, Layout } from '../../../LineChart';
import { TimeseriesChartMetadata } from '../../domain/internal/types';
import { useTranslation } from '../../i18n/useTranslation';

import { CONFIG, LAYOUT } from './constants';
import { formatTooltipContent } from './helpers/formatTooltipContent';

export interface TimeseriesChartSmallProps extends LineChartProps {
  metadata: TimeseriesChartMetadata;
}

export const TimeseriesChartSmall: React.FC<TimeseriesChartSmallProps> = ({
  metadata,
  ...props
}) => {
  const { t } = useTranslation();

  const layout: Partial<Layout> = useMemo(() => {
    const numberOfPoints = (props.data as Data).x.length;

    /**
     * If there is only 1 datapoint, line cannot be defined.
     * Hence, we force to show markers.
     * Then we can see only 1 marker for the datapoint.
     */
    if (numberOfPoints === 1) {
      return {
        ...LAYOUT,
        showMarkers: true,
      };
    }

    return LAYOUT;
  }, [props.data]);

  const { unit } = metadata;

  return (
    <LineChart
      {...props}
      variant="small"
      layout={layout}
      config={CONFIG}
      formatTooltipContent={(tooltipProps) =>
        formatTooltipContent(tooltipProps, unit, t)
      }
    />
  );
};
