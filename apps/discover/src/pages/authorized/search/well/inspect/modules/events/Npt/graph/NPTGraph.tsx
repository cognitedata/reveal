import React, { useCallback, useEffect, useMemo, useState } from 'react';

import get from 'lodash/get';

import { now, fromNow } from '_helpers/date';
import {
  SelectedBarData,
  StackedBarChart,
} from 'components/charts/modules/StackedBarChart';
import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectSelectedWellboreNames } from 'modules/wellInspect/hooks/useWellInspect';
import { NPTEvent } from 'modules/wellSearch/types';

import { accessors } from '../constants';

import {
  GRAPH_TITLE,
  GRAPH_X_AXIS_TITLE,
  NPT_GRAPH_OPTIONS,
} from './constants';
import { SelectedWellbore } from './types';

interface Props {
  events: NPTEvent[];
  onSelectBar: (selectedWellbore: SelectedWellbore) => void;
}

export const NPTGraph: React.FC<Props> = React.memo(
  ({ events, onSelectBar }) => {
    const wellboreNames = useWellInspectSelectedWellboreNames();

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

      return events.map((event) => ({
        ...event,
        [accessors.DURATION]: get(event, accessors.DURATION, 0) / 24,
      }));
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

    return useDeepMemo(
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
          options={NPT_GRAPH_OPTIONS}
          onUpdate={handleOnUpdateGraph}
          onSelectBar={handleOnSelectBar}
        />
      ),
      [wellboreNames, chartSubtitle]
    );
  }
);
