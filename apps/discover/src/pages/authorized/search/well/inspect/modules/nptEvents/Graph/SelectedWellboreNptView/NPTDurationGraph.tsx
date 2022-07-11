import {
  NptCodeDefinitionType,
  NptView,
} from 'domain/wells/npt/internal/types';

import React, { useCallback, useMemo } from 'react';

import { AxisPlacement } from 'components/Charts/common/Axis';
import {
  StackedBarChart,
  StackedBarChartOptions,
} from 'components/Charts/modules/StackedBarChart';

import { NptCodeDefinition } from '../../components/NptCodeDefinition';
import { accessors } from '../../constants';
import {
  NPT_GRAPH_COMMON_COLOR_CONFIG,
  NPT_GRAPH_COMMON_OPTIONS,
} from '../constants';
import { adaptEventsToDaysDuration, getNptCodesColorMap } from '../utils';

import {
  GRAPH_MAX_HEIGHT,
  NPT_DURATION_GRAPH_TITLE,
  NPT_DURATION_GRAPH_X_AXIS_TITLE,
} from './constants';
import { ChartWrapper, IconStyle } from './elements';
import { NptTooltip } from './NptTooltip';

export const NPTDurationGraph: React.FC<{
  data: NptView[];
  nptCodeDefinitions?: NptCodeDefinitionType;
}> = React.memo(({ data, nptCodeDefinitions }) => {
  const getFormatTooltip = useCallback(
    (event: NptView) => (
      <NptTooltip event={event} definitions={nptCodeDefinitions} />
    ),
    []
  );

  const getInfoIcon = useCallback(
    (option: string) => (
      <NptCodeDefinition
        nptCodeDefinition={nptCodeDefinitions && nptCodeDefinitions[option]}
        iconStyle={IconStyle}
      />
    ),
    []
  );

  const options: StackedBarChartOptions<NptView> = useMemo(
    () => ({
      ...NPT_GRAPH_COMMON_OPTIONS,
      colorConfig: {
        ...NPT_GRAPH_COMMON_COLOR_CONFIG,
        colors: getNptCodesColorMap(data),
      },
      maxHeight: GRAPH_MAX_HEIGHT,
      legendOptions: {
        isolate: false,
      },
      hideBarLabels: true,
      margins: {
        top: -7,
      },
      formatTooltip: getFormatTooltip,
      getInfoIcon,
    }),
    [data]
  );

  const adaptedEvents = useMemo(() => adaptEventsToDaysDuration(data), [data]);

  return (
    <ChartWrapper>
      <StackedBarChart<NptView>
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
});
