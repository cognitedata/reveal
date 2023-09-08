import { useEffect } from 'react';

import { RuleDto } from '@data-quality/api/codegen';
import { useLoadDataSource } from '@data-quality/hooks';
import { getQueryKey } from '@data-quality/utils/namingPatterns';
import {
  TimeSeriesType,
  formatTimeriesResponse,
  getTimeSeriesItemRequest,
} from '@data-quality/utils/validationTimeseries';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';

export type DatapointsTarget = 'dataSource' | 'rules';

type LoadDatapointsProps = {
  rules: RuleDto[];
  target: DatapointsTarget;
};

/** Load and constantly pool datapoints for specific timeseries.
 *
 * The datapoints will be fetched based on the given target, which can be either data source or rules */
export const useLoadDatapoints = ({ rules, target }: LoadDatapointsProps) => {
  const { t } = useTranslation('useLoadDatapoints');

  const { dataSource } = useLoadDataSource();

  const { data, isLoading, refetch } = useQuery({
    onError: (err) => {
      Notification({
        type: 'error',
        message: t(
          'data_quality_not_found_timeseries',
          'Something went wrong. The timeseries could not be loaded.'
        ),
        errors: JSON.stringify(err),
      });
    },
    queryKey: getQueryKey(target, 'datapoints', dataSource?.externalId),
    queryFn: async () => {
      if (!dataSource || rules.length === 0) return [];

      const timeseriesToRetrieve = getTimeseriesQuery(
        target,
        dataSource.externalId,
        rules
      );

      const res = await sdk.datapoints.retrieve(timeseriesToRetrieve);
      return formatTimeriesResponse(res);
    },
    refetchInterval: 5000,
  });

  // When the target changes, make sure to refetch the datapoints
  useEffect(() => {
    refetch();
  }, [dataSource?.externalId, rules]);

  return {
    datapoints: data ?? [],
    isLoading,
  };
};

/** Create a query object used to retrieve datapoints based in the desired target */
const getTimeseriesQuery = (
  target: DatapointsTarget,
  dataSourceId: string,
  rules: RuleDto[]
) => {
  if (target === 'rules') {
    return {
      items: rules?.flatMap((rule) => [
        getTimeSeriesItemRequest(
          TimeSeriesType.SCORE,
          dataSourceId,
          rule.externalId
        ),
        getTimeSeriesItemRequest(
          TimeSeriesType.TOTAL_ITEMS_COUNT,
          dataSourceId,
          rule.externalId
        ),
      ]),
    };
  }

  return {
    items: [
      getTimeSeriesItemRequest(TimeSeriesType.SCORE, dataSourceId),
      getTimeSeriesItemRequest(TimeSeriesType.TOTAL_ITEMS_COUNT, dataSourceId),
    ],
  };
};
