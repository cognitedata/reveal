import React, { useCallback, useEffect, useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import { now, fromNow } from 'utils/date';

import { PerfMetrics } from '@cognite/metrics';

import {
  SelectedBarData,
  StackedBarChart,
  StackedBarChartOptions,
} from 'components/Charts/modules/StackedBarChart';
import {
  PerformanceMetricsObserver,
  PerformanceObserved,
  nptGraphPageLoadQuery,
} from 'components/Performance';

import { NptCodeDefinition } from '../components/NptCodeDefinition';
import { accessors } from '../constants';
import { useNptData } from '../hooks/useNptData';
import { NptView } from '../types';

import {
  GRAPH_LEGEND_TITLE,
  GRAPH_MAX_HEIGHT,
  GRAPH_TITLE,
  GRAPH_X_AXIS_TITLE,
  NPT_GRAPH_COMMON_COLOR_CONFIG,
  NPT_GRAPH_COMMON_OPTIONS,
} from './constants';
import { IconStyle } from './SelectedWellboreNptView/elements';
import { NptTooltip } from './SelectedWellboreNptView/NptTooltip';
import { SelectedWellbore } from './types';
import { adaptEventsToDaysDuration, getNptCodesColorMap } from './utils';

interface Props {
  data: NptView[];
  onSelectBar: (selectedWellbore: SelectedWellbore) => void;
}

export const NptGraph: React.FC<Props> = React.memo(({ data, onSelectBar }) => {
  const { nptCodeDefinitions, wellboreNames } = useNptData();

  const [lastUpdatedTime, setLastUpdatedTime] = useState<number>();
  const [chartSubtitle, setChartSubtitle] = useState<string>(
    'Calculating last updated time...'
  );

  useEffect(() => {
    let updateChartSubtitle: NodeJS.Timeout;

    if (lastUpdatedTime) {
      updateChartSubtitle = setInterval(
        () => setChartSubtitle(`Updated ${fromNow(lastUpdatedTime)}`),
        1000
      );
    }

    return () => clearInterval(updateChartSubtitle);
  }, [lastUpdatedTime]);

  const adaptedData: NptView[] = useMemo(() => {
    setLastUpdatedTime(now());
    if (isEmpty(data)) {
      PerfMetrics.trackPerfEnd('NPT_PAGE_LOAD');
    } else {
      PerfMetrics.trackPerfEnd('NPT_PAGE_LOAD');
      PerfMetrics.trackPerfStart('NPT_GRAPH_RENDER');
    }
    return adaptEventsToDaysDuration(data);
  }, [data]);

  const handlePerformanceObserved = ({ mutations }: PerformanceObserved) => {
    if (mutations) {
      PerfMetrics.findInMutation({
        ...nptGraphPageLoadQuery,
        mutations,
        callback: (_output: any) => {
          PerfMetrics.trackPerfEnd('NPT_GRAPH_RENDER');
          PerfMetrics.trackPerfEnd('NPT_PAGE_LOAD');
        },
      });
    }
  };

  const handleOnUpdateGraph = useCallback(() => setLastUpdatedTime(now()), []);

  const handleOnSelectBar = useCallback(
    (selectedBarData: SelectedBarData<NptView>) => {
      onSelectBar({
        wellboreName: selectedBarData.key,
        index: selectedBarData.index,
      });
    },
    []
  );

  const getFormatTooltip = useCallback(
    (event: NptView) => (
      <NptTooltip event={event} definitions={nptCodeDefinitions} />
    ),
    []
  );

  const getInfoIcon = useCallback(
    (option: string) => (
      <NptCodeDefinition
        nptCodeDefinition={nptCodeDefinitions[option]}
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
        title: GRAPH_LEGEND_TITLE,
        overlay: true,
      },
      formatTooltip: getFormatTooltip,
      getInfoIcon,
    }),
    [data]
  );

  return useMemo(
    () => (
      <PerformanceMetricsObserver onChange={handlePerformanceObserved}>
        <StackedBarChart<NptView>
          id="npt-events-graph"
          data={adaptedData}
          xAxis={{ accessor: accessors.DURATION, title: GRAPH_X_AXIS_TITLE }}
          yAxis={{
            accessor: accessors.WELLBORE_NAME,
            reverseScaleDomain: true,
          }}
          yScaleDomain={wellboreNames}
          groupDataInsideBarsBy={accessors.NPT_CODE}
          title={GRAPH_TITLE}
          subtitle={chartSubtitle}
          options={options}
          onUpdate={handleOnUpdateGraph}
          onSelectBar={handleOnSelectBar}
        />
      </PerformanceMetricsObserver>
    ),
    [wellboreNames, chartSubtitle]
  );
});
