import { DatapointsMultiQuery } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import chartAtom from 'models/chart/atom';
import { timeseriesAtom } from 'models/timeseries/atom';
import { availableWorkflows } from 'models/workflows/selectors';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Chart } from 'models/chart/types';
import { calculateGranularity } from 'utils/timeseries';
import { CHART_POINTS_PER_SERIES } from 'utils/constants';
import { updateSourceAxisForChart } from 'models/chart/updates';
import { TimeseriesEntry } from 'models/timeseries/types';
import { Icon } from '@cognite/cogs.js';
import { ChartingContainer, LoadingContainer } from './elements';
import { cleanTimeseriesCollection, cleanWorkflowCollection } from './utils';
import PlotlyChart, { PlotNavigationUpdate } from './PlotlyChart';

type Props = {
  chart?: Chart;
  isYAxisShown?: boolean;
  isMinMaxShown?: boolean;
  isGridlinesShown?: boolean;
  isPreview?: boolean;
  stackedMode?: boolean;
  mergeUnits?: boolean;
};

const PlotlyChartContainer = ({
  chart = undefined,
  isYAxisShown = true,
  isMinMaxShown = false,
  isGridlinesShown = false,
  isPreview = false,
  stackedMode = false,
  mergeUnits = false,
}: Props) => {
  const sdk = useSDK();
  const pointsPerSeries = isPreview ? 100 : CHART_POINTS_PER_SERIES;
  const [dragmode, setDragmode] = useState<'zoom' | 'pan'>('pan');

  /**
   * Get local chart context
   */
  const [, setChart] = useRecoilState(chartAtom);
  const dateFrom = chart?.dateFrom;
  const dateTo = chart?.dateTo;

  const queries =
    chart?.timeSeriesCollection?.map(({ tsExternalId }) => ({
      items: [{ externalId: tsExternalId }],
      start: dayjs(dateFrom).toDate(),
      end: dayjs(dateTo).toDate(),
      granularity: calculateGranularity(
        [dayjs(dateFrom).valueOf(), dayjs(dateTo).valueOf()],
        pointsPerSeries
      ),
      aggregates: ['average', 'min', 'max', 'count', 'sum'],
      limit: pointsPerSeries,
    })) || [];

  /**
   * This is only used for the overview preview mode
   */
  const { data: timeseriesPreview = [], isFetching: isFetchingPreview } =
    useQuery(
      ['chart-data', 'timeseries', queries],
      () => {
        return Promise.allSettled(
          queries.map((q) =>
            sdk.datapoints.retrieve(q as DatapointsMultiQuery).then((r) => r[0])
          )
        ).then((results) => {
          return results
            .map((result) => ('value' in result ? result.value : undefined))
            .filter(Boolean)
            .map((series) => {
              return {
                externalId: series?.externalId,
                loading: false,
                series,
              } as TimeseriesEntry;
            });
        });
      },
      {
        enabled: !!chart && !!isPreview,
      }
    );

  const localTimeseries = useRecoilValue(timeseriesAtom);
  const localWorkflows = useRecoilValue(availableWorkflows);

  /**
   * Filter out callIDs that trigger unnecessary recalcs/rerenders
   */
  const tsCollectionAsString = JSON.stringify(
    cleanTimeseriesCollection(chart?.timeSeriesCollection || [])
  );
  const wfCollectionAsString = JSON.stringify(
    cleanWorkflowCollection(chart?.workflowCollection || [])
  );

  const timeseries = useMemo(
    () => JSON.parse(tsCollectionAsString),
    [tsCollectionAsString]
  );

  const calculations = useMemo(
    () => JSON.parse(wfCollectionAsString),
    [wfCollectionAsString]
  );

  const timeseriesData = isPreview ? timeseriesPreview : localTimeseries;
  const calculationsData = localWorkflows;
  const thresholds = chart?.thresholdCollection;

  const handleChartNavigation = useCallback(
    ({ x, y, dragmode: newDragmode }: PlotNavigationUpdate) => {
      if (isPreview) {
        return;
      }

      setChart((oldChart) =>
        updateSourceAxisForChart(oldChart!, {
          x,
          y: !stackedMode ? y : [],
        })
      );

      if (newDragmode) {
        setDragmode(newDragmode);
      }
    },
    [setChart, isPreview, stackedMode]
  );

  const isYAxisShownOverride = !isPreview && isYAxisShown;

  const hasValidDates =
    !Number.isNaN(new Date(dateFrom || '').getTime()) &&
    !Number.isNaN(new Date(dateTo || '').getTime());

  if (!hasValidDates) {
    return null;
  }

  const plotProps: React.ComponentProps<typeof PlotlyChart> = {
    dateFrom,
    dateTo,
    timeseries,
    timeseriesData,
    calculations,
    calculationsData,
    thresholds,
    isYAxisShown: isYAxisShownOverride,
    isMinMaxShown,
    isGridlinesShown,
    isPreview,
    stackedMode,
    mergeUnits,
    dragmode,
    onPlotNavigation: handleChartNavigation,
  };

  return (
    <ChartingContainer>
      {isFetchingPreview ? (
        <LoadingContainer>
          <Icon type="Loader" />
        </LoadingContainer>
      ) : (
        <PlotlyChart {...plotProps} />
      )}
    </ChartingContainer>
  );
};

export default PlotlyChartContainer;
