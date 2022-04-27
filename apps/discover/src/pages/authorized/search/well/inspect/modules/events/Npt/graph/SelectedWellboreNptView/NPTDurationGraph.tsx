import React, { useMemo } from 'react';

import { AxisPlacement } from 'components/charts/common/Axis';
import {
  StackedBarChart,
  StackedBarChartOptions,
} from 'components/charts/modules/StackedBarChart';
import { NPTEvent } from 'modules/wellSearch/types';

import { accessors } from '../../constants';
import { NPT_GRAPH_OPTIONS } from '../constants';
import { adaptEventsToDaysDuration } from '../utils';

import {
  GRAPH_MAX_HEIGHT,
  NPT_DURATION_GRAPH_TITLE,
  NPT_DURATION_GRAPH_X_AXIS_TITLE,
} from './constants';
import { ChartWrapper } from './elements';

export const NPTDurationGraph: React.FC<{ events: NPTEvent[] }> = React.memo(
  ({ events }) => {
    const options: StackedBarChartOptions<NPTEvent> = useMemo(
      () => ({
        ...NPT_GRAPH_OPTIONS,
        maxHeight: GRAPH_MAX_HEIGHT,
        legendOptions: {
          isolate: false,
        },
        hideBarLabels: true,
        margins: {
          top: -7,
        },
      }),
      []
    );

    const adaptedEvents = useMemo(
      () => adaptEventsToDaysDuration(events),
      [events]
    );

    return (
      <ChartWrapper>
        <StackedBarChart<NPTEvent>
          id="selected-wellbore-npt-duration-graph"
          data={adaptedEvents}
          xAxis={{
            accessor: accessors.DURATION,
            title: NPT_DURATION_GRAPH_X_AXIS_TITLE,
            placement: AxisPlacement.Bottom,
          }}
          yAxis={{ accessor: accessors.WELLBORE_NAME, spacing: 50 }}
          groupDataInsideBarsBy={accessors.NPT_CODE}
          title={NPT_DURATION_GRAPH_TITLE}
          options={options}
        />
      </ChartWrapper>
    );
  }
);
