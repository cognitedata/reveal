import React, { useMemo } from 'react';

import { AxisPlacement } from 'components/charts/common/Axis';
import {
  StackedBarChart,
  StackedBarChartOptions,
} from 'components/charts/modules/StackedBarChart';
import { useNPTGraphSelectedWellboreData } from 'modules/wellInspect/selectors';
import { NPTEvent } from 'modules/wellSearch/types';

import { accessors } from '../../constants';
import { NPT_GRAPH_OPTIONS } from '../constants';

import {
  NPT_DURATION_GRAPH_TITLE,
  NPT_DURATION_GRAPH_X_AXIS_TITLE,
} from './constants';
import { ChartWrapper } from './elements';

export const NPTDurationGraph: React.FC = () => {
  const { data: selectedWellboreData } = useNPTGraphSelectedWellboreData();

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
        data={selectedWellboreData}
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
};
