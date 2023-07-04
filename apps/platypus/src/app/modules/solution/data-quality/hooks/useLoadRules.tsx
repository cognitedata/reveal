import { useEffect, useState } from 'react';

import { useListAllRules } from '@data-quality/api/codegen';
import { useLoadDataSource } from '@data-quality/hooks';
import {
  TimeSeriesType,
  getTimeSeriesItemRequest,
} from '@data-quality/utils/validationTimeseries';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import sdk from '@cognite/cdf-sdk-singleton';
import { Datapoints } from '@cognite/sdk/dist/src';

/** Load all the rules and their timeseries + datapoints in a datasource. */
export const useLoadRules = () => {
  const { t } = useTranslation('useLoadRules');

  const [datapoints, setDataPoints] = useState<Datapoints[]>([]);
  const [loadingDatapoints, setLoadingDatapoints] = useState(false);

  const { dataSource } = useLoadDataSource();

  const {
    data: rulesData,
    isLoading: rulesLoading,
    error: rulesError,
    refetch,
  } = useListAllRules(
    {
      pathParams: {
        dataSourceId: dataSource?.externalId,
      },
    },
    { enabled: !!dataSource?.externalId }
  );

  const rules = rulesData?.items || [];

  useEffect(() => {
    const getDatapoints = async () => {
      if (!dataSource || !rules.length) return;

      setLoadingDatapoints(true);

      const timeseriesToRetrieve = rules.flatMap((rule) => [
        getTimeSeriesItemRequest(
          TimeSeriesType.SCORE,
          dataSource.externalId,
          rule.externalId
        ),
        getTimeSeriesItemRequest(
          TimeSeriesType.TOTAL_ITEMS_COUNT,
          dataSource.externalId,
          rule.externalId
        ),
      ]);

      try {
        await sdk.datapoints
          .retrieveLatest(timeseriesToRetrieve)
          .then(setDataPoints);
      } catch (err) {
        Notification({
          type: 'error',
          message: t(
            'data_quality_not_found_timeseries_rules',
            'Something went wrong. The timeseries for the given rules could not be loaded.'
          ),
          errors: JSON.stringify(err),
        });
      } finally {
        setLoadingDatapoints(false);
      }
    };

    // No rules, then there are no timeseries yet
    if (!rules.length && datapoints.length > 0) {
      setDataPoints([]);
    } else {
      getDatapoints();
    }
  }, [rules]);

  return {
    datapoints,
    error: rulesError,
    loadingDatapoints,
    loadingRules: rulesLoading,
    refetchRules: refetch,
    rules,
  };
};
