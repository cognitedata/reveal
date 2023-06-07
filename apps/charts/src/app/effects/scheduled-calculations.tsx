import { useSDK } from '@cognite/sdk-provider';
import { DatapointsMultiQuery, Timeseries } from '@cognite/sdk';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import { useChartAtom } from 'models/chart/atom';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRawOrAggregatedDatapoints } from 'services/cdf-api';
import { useDebounce } from 'use-debounce';
import { CHART_POINTS_PER_SERIES } from 'utils/constants';
import { calculateGranularity } from 'utils/timeseries';
import { useScheduledCalculationData } from 'models/scheduled-calculation-results/atom';
import { useScheduledCalculationTasks } from 'domain/scheduled-calculation/service/queries/useScheduledCalculationTasks';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { CalculationTaskSchedule } from 'domain/scheduled-calculation/service/types';

export const ScheduledCalculationCollectionEffects = () => {
  const [chart] = useChartAtom();
  const taskExternalIds = chart?.scheduledCalculationCollection?.map(
    (scheduledCalculation) => scheduledCalculation.id
  );
  const { data: tasks } = useScheduledCalculationTasks(
    taskExternalIds?.map((externalId) => ({ externalId })) || []
  );

  const timeseriesEffectElements = tasks?.map((task) => (
    <ScheduledCalculationEffects key={task.externalId} task={task} />
  ));

  return <>{timeseriesEffectElements}</>;
};

export const ScheduledCalculationEffects = ({
  task,
}: {
  task: CalculationTaskSchedule;
}) => {
  const [chart] = useChartAtom();
  const { dateFrom, dateTo } = chart!;
  const [, setScheduledCalculationData] = useScheduledCalculationData();
  const sdk = useSDK();
  const { data: timeseries } = useCdfItem<Timeseries>(
    'timeseries',
    { externalId: task.targetTimeseriesExternalId },
    { enabled: Boolean(task.targetTimeseriesExternalId) }
  );

  const { externalId: tsExternalId } = timeseries || {};

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
        [task.externalId]: {
          ...task,
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
    tsExternalId,
  ]);

  return null;
};
