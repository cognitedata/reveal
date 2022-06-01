import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { now, fromNow } from 'utils/date';

import {
  SelectedBarData,
  StackedBarChart,
  StackedBarChartOptions,
} from 'components/Charts/modules/StackedBarChart';
import { NPTEvent } from 'modules/wellSearch/types';

import { accessors } from '../constants';
import { NptCodeDefinition } from '../NptCodeDefinition';

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
import { useDataLayer } from './useDataLayer';
import { adaptEventsToDaysDuration, getNptCodesColorMap } from './utils';

interface Props {
  events: NPTEvent[];
  onSelectBar: (selectedWellbore: SelectedWellbore) => void;
}

export const NPTGraph: React.FC<Props> = React.memo(
  ({ events, onSelectBar }) => {
    const { nptCodeDefinitions, wellboreNames } = useDataLayer();

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

    const data: NPTEvent[] = useMemo(() => {
      setLastUpdatedTime(now());

      return adaptEventsToDaysDuration(events);
    }, [events]);

    const handleOnUpdateGraph = useCallback(
      () => setLastUpdatedTime(now()),
      []
    );

    const handleOnSelectBar = useCallback(
      (selectedBarData: SelectedBarData<NPTEvent>) => {
        onSelectBar({
          wellboreName: selectedBarData.key,
          index: selectedBarData.index,
        });
      },
      []
    );

    const getFormatTooltip = useCallback(
      (event: NPTEvent) => (
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

    const options: StackedBarChartOptions<NPTEvent> = useMemo(
      () => ({
        ...NPT_GRAPH_COMMON_OPTIONS,
        colorConfig: {
          ...NPT_GRAPH_COMMON_COLOR_CONFIG,
          colors: getNptCodesColorMap(events),
        },
        maxHeight: GRAPH_MAX_HEIGHT,
        legendOptions: {
          title: GRAPH_LEGEND_TITLE,
          overlay: true,
        },
        formatTooltip: getFormatTooltip,
        getInfoIcon,
      }),
      [events]
    );

    return useMemo(
      () => (
        <StackedBarChart<NPTEvent>
          id="npt-events-graph"
          data={data}
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
      ),
      [wellboreNames, chartSubtitle]
    );
  }
);
