import { NptAggregateView } from 'domain/wells/npt/internal/types';

import React, { useCallback, useEffect, useState } from 'react';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import { now, fromNow } from 'utils/date';

import { PerfMetrics } from '@cognite/metrics';

import {
  SelectedBarData,
  StackedBarChart,
  StackedBarChartOptions,
} from 'components/Charts/modules/StackedBarChart';
import { Loading } from 'components/Loading';
import {
  PerformanceMetricsObserver,
  PerformanceObserved,
  nptGraphPageLoadQuery,
} from 'components/Performance';
import { useDeepMemo } from 'hooks/useDeep';

import { NptCodeDefinition } from '../components/NptCodeDefinition';
import { accessors } from '../constants';
import { useNptDataForGraph } from '../hooks/useNptDataForGraph';

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
import { adaptEventsToDaysDuration, getNptCodesColorMap } from './utils';

interface Props {
  onSelectBar: (selectedWellbore?: string) => void;
}

export const NptGraph: React.FC<Props> = React.memo(({ onSelectBar }) => {
  const { isLoading, data, wellboreNames, nptCodeDefinitions } =
    useNptDataForGraph();

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

  const adaptedData: NptAggregateView[] = useDeepMemo(() => {
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
    (selectedBarData: SelectedBarData<NptAggregateView>) => {
      onSelectBar(head(selectedBarData.data)?.wellboreMatchingId);
    },
    []
  );

  const getFormatTooltip = useCallback(
    (event: NptAggregateView) => (
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

  const options: StackedBarChartOptions<NptAggregateView> = useDeepMemo(
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <PerformanceMetricsObserver onChange={handlePerformanceObserved}>
      <StackedBarChart<NptAggregateView>
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
  );
});
