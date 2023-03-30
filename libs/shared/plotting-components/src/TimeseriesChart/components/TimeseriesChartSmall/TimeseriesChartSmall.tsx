import * as React from 'react';
import { useMemo } from 'react';

import { Data, LineChart, LineChartProps, Layout } from '../../../LineChart';

import { CONFIG, LAYOUT } from './constants';
import { formatTooltipContent } from './helpers/formatTooltipContent';

export const TimeseriesChartSmall: React.FC<LineChartProps> = (props) => {
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

  return (
    <LineChart
      {...props}
      variant="small"
      layout={layout}
      config={CONFIG}
      formatTooltipContent={formatTooltipContent}
    />
  );
};
