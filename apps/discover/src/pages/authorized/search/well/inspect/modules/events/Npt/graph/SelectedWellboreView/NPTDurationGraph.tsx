import React, { useMemo } from 'react';

import { StackedBarChart } from 'components/charts';
import {
  AxisPlacement,
  StackedBarChartOptions,
} from 'components/charts/StackedBarChart/types';
import { useNPTGraphSelectedWellboreData } from 'modules/wellInspect/selectors';
import { NPTEvent } from 'modules/wellSearch/types';

import { accessors } from '../../constants';
import { NPT_GRAPH_OPTIONS } from '../constants';

import {
  NPT_DURATION_GRAPH_TITLE,
  NPT_DURATION_GRAPH_X_AXIS_LABEL,
} from './constants';
import { NPTDurationGraphWrapper } from './elements';

export const NPTDurationGraph: React.FC = () => {
  const selectedWellboreData = useNPTGraphSelectedWellboreData();

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
    <NPTDurationGraphWrapper>
      <StackedBarChart<NPTEvent>
        data={selectedWellboreData.data}
        xAxis={{
          accessor: accessors.DURATION,
          label: NPT_DURATION_GRAPH_X_AXIS_LABEL,
          placement: AxisPlacement.Bottom,
        }}
        yAxis={{ accessor: accessors.WELLBORE_NAME, spacing: 50 }}
        groupDataInsideBarsBy={accessors.NPT_CODE}
        title={NPT_DURATION_GRAPH_TITLE}
        options={options}
      />
    </NPTDurationGraphWrapper>
  );
};
