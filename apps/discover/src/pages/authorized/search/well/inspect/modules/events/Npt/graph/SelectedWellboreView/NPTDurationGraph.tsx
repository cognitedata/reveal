import React, { useMemo } from 'react';

import { AxisPlacement } from 'components/charts/common/Axis';
import {
  StackedBarChart,
  StackedBarChartOptions,
} from 'components/charts/modules/StackedBarChart';
import { NPTEvent } from 'modules/wellSearch/types';

import { accessors } from '../../constants';
import { NPT_GRAPH_OPTIONS } from '../constants';

import {
  NPT_DURATION_GRAPH_TITLE,
  NPT_DURATION_GRAPH_X_AXIS_TITLE,
} from './constants';
import { ChartWrapper } from './elements';

export const NPTDurationGraph: React.FC<{ events: NPTEvent[] }> = React.memo(
  ({ events }) => {
    const options: StackedBarChartOptions<NPTEvent> = useMemo(
      () => ({
        ...NPT_GRAPH_OPTIONS,
        legendOptions: {
          isolate: false,
        },
        hideBarLabels: true,
        margins: { top: -7, left: 10 },
      }),
      []
    );

    return (
      <ChartWrapper>
        <StackedBarChart<NPTEvent>
          id="selected-wellbore-npt-duration-graph"
          data={events}
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
