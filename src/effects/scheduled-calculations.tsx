import { useSDK } from '@cognite/sdk-provider';
import { DatapointsMultiQuery, Timeseries } from '@cognite/sdk';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import { useChartAtom } from 'models/chart/atom';
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { fetchRawOrAggregatedDatapoints } from 'services/cdf-api';
import { useDebounce } from 'use-debounce';
import { CHART_POINTS_PER_SERIES } from 'utils/constants';
import { calculateGranularity } from 'utils/timeseries';
import { useScheduledCalculationData } from 'models/scheduled-calculation-results/atom';
import { useTimeseriesFromScheduledCalculations } from '../domain/scheduled-calculation/internal/queries/useTimeseriesFromScheduledCalculations';

export const ScheduledCalculationCollectionEffects = () => {
  const [chart] = useChartAtom();
  const taskExternalIds = chart?.scheduledCalculationCollection?.map(
    (scheduledCalculation) => scheduledCalculation.id
  );

  const { data } = useTimeseriesFromScheduledCalculations(
    taskExternalIds?.map((externalId) => ({ externalId })) || []
  );

  const timeseriesEffectElements = data?.map((timeseries, index) => (
    <ScheduledCalculationEffects
      key={timeseries.id}
      timeseries={timeseries}
      taskExternalId={taskExternalIds?.[index]!}
    />
  ));

  return <>{timeseriesEffectElements}</>;
};

export const ScheduledCalculationEffects = ({
  timeseries,
  taskExternalId,
}: {
  timeseries: Timeseries;
  taskExternalId: string;
}) => {
  const { externalId: tsExternalId } = timeseries;
  const [chart] = useChartAtom();
  const { dateFrom, dateTo } = chart!;
  const [, setScheduledCalculationData] = useScheduledCalculationData();
  const sdk = useSDK();

  const [debouncedRange] = useDebounce({ dateFrom, dateTo }, 50, {
    equalityFn: (l, r) => isEqual(l, r),
  });

  const query: DatapointsMultiQuery = {
    items: [{ externalId: tsExternalId || '' }],
    start: dayjs(debouncedRange.dateFrom!).toDate(),
    end: dayjs(debouncedRange.dateTo!).toDate(),
    granularity: calculateGranularity(
      [
        dayjs(debouncedRange.dateFrom!).valueOf(),
        dayjs(debouncedRange.dateTo!).valueOf(),
      ],
      CHART_POINTS_PER_SERIES
    ),
    aggregates: ['average', 'min', 'max', 'count', 'sum'],
    limit: CHART_POINTS_PER_SERIES,
  };

  const {
    data: timeseriesData,
    isFetching,
    isSuccess,
  } = useQuery(
    ['chart-data', 'scheduled-calculation', tsExternalId, query],
    () => fetchRawOrAggregatedDatapoints(sdk, query),
    {
      enabled: !!tsExternalId,
    }
  );

  useEffect(() => {
    setScheduledCalculationData((scheduledCalculationData) => {
      return {
        ...scheduledCalculationData,
        [taskExternalId]: {
          externalId: taskExternalId,
          loading: isFetching,
          series: isSuccess
            ? timeseriesData
            : scheduledCalculationData?.[tsExternalId!]?.series,
        },
      };
    });
  }, [
    isSuccess,
    isFetching,
    timeseriesData,
    setScheduledCalculationData,
    timeseries.id,
    tsExternalId,
  ]);

  return null;
};
