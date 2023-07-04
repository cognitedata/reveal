import { useEffect, useState } from 'react';

import { useLoadDataSource } from '@data-quality/hooks';
import {
  TimeSeriesType,
  getTimeSeriesItemRequest,
} from '@data-quality/utils/validationTimeseries';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import sdk from '@cognite/cdf-sdk-singleton';
import { Datapoints } from '@cognite/sdk/dist/src';

/** Load the timeseries and datapoints for a data source.*/
export const useDataSourceValidity = () => {
  const { t } = useTranslation('useDataSourceValidity');

  const [datapoints, setDataPoints] = useState<Datapoints[]>([]);
  const [loadingDatapoints, setLoadingDatapoints] = useState(false);

  const { dataSource } = useLoadDataSource();

  useEffect(() => {
    const getDatapoints = async () => {
      if (!dataSource) return;

      setLoadingDatapoints(true);

      const timeseriesToRetrieve = [
        getTimeSeriesItemRequest(TimeSeriesType.SCORE, dataSource.externalId),
        getTimeSeriesItemRequest(
          TimeSeriesType.TOTAL_ITEMS_COUNT,
          dataSource.externalId
        ),
      ];

      try {
        await sdk.datapoints
          .retrieveLatest(timeseriesToRetrieve)
          .then(setDataPoints);
      } catch (err) {
        setDataPoints([]);
        Notification({
          type: 'error',
          message: t(
            'data_quality_not_found_timeseries_ds',
            'Something went wrong. The timeseries for the data source could not be loaded.'
          ),
          errors: JSON.stringify(err),
        });
      } finally {
        setLoadingDatapoints(false);
      }
    };

    // No data source, then there are no timeseries yet
    if (!dataSource && datapoints.length > 0) {
      setDataPoints([]);
    } else {
      getDatapoints();
    }
  }, [dataSource?.externalId]);

  return {
    datapoints,
    loadingDatapoints,
  };
};
