import React, { useCallback, useEffect, useMemo, useState } from 'react';

import get from 'lodash/get';

import { now, fromNow } from '_helpers/date';
import { StackedBarChart } from 'components/charts';
import { StackedBarChartOptions } from 'components/charts/StackedBarChart/types';
import { useInspectSidebarWidth } from 'modules/wellInspect/selectors';
import { useSecondarySelectedOrHoveredWellbores } from 'modules/wellSearch/selectors';
import { NPTEvent } from 'modules/wellSearch/types';

import { accessors, colors, DEFAULT_NPT_COLOR } from '../constants';

import {
  GRAPH_TITLE,
  GRAPH_X_AXIS_LABEL,
  GRAPH_LEGEND_TITLE,
  NO_NPT_DATA_BAR_COLOR,
  NO_DATA_AMONG_SELECTED_NPT_CODES_TEXT,
  NO_DATA_TEXT,
} from './constants';
import { formatTooltip } from './utils';

export const NPTGraph: React.FC<{ events: NPTEvent[] }> = React.memo(
  ({ events }) => {
    const selectedSecondaryWellbores = useSecondarySelectedOrHoveredWellbores();
    const inspectSidebarWidth = useInspectSidebarWidth();

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

    const yScaleDomain = useMemo(
      () =>
        selectedSecondaryWellbores.map(
          (wellbore) => wellbore.description || ''
        ),
      [events]
    );

    const options: StackedBarChartOptions<NPTEvent> = useMemo(
      () => ({
        barColorConfig: {
          colors,
          accessor: accessors.NPT_CODE,
          defaultColor: DEFAULT_NPT_COLOR,
          noDataBarColor: NO_NPT_DATA_BAR_COLOR,
        },
        formatTooltip,
        legendTitle: GRAPH_LEGEND_TITLE,
        fixXValuesToDecimalPlaces: 1,
        noDataAmongSelectedCheckboxesText:
          NO_DATA_AMONG_SELECTED_NPT_CODES_TEXT,
        noDataText: NO_DATA_TEXT,
      }),
      []
    );

    const handleOnUpdateGraph = useCallback(
      () => setLastUpdatedTime(now()),
      []
    );

    return (
      <StackedBarChart<NPTEvent>
        data={data}
        xAxis={{ accessor: accessors.DURATION, label: GRAPH_X_AXIS_LABEL }}
        yAxis={{ accessor: accessors.WELLBORE_NAME }}
        yScaleDomain={yScaleDomain}
        groupDataInsideBarsBy={accessors.NPT_CODE}
        title={GRAPH_TITLE}
        subtitle={chartSubtitle}
        options={options}
        offsetLeftDependencies={[inspectSidebarWidth]}
        onUpdate={handleOnUpdateGraph}
      />
    );
  }
);
