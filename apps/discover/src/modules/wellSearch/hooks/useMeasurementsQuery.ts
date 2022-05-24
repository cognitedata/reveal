import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import {
  LOG_MEASUREMENTS,
  LOG_WELLS_MEASUREMENTS_NAMESPACE,
} from 'constants/logging';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { useMetricLogger, TimeLogStages } from 'hooks/useTimeLog';
import { useWellInspectSelectedWellboreMatchingIds } from 'modules/wellInspect/hooks/useWellInspect';

import { getMeasurementsByWellboreIds } from '../service/sequence';
import { WellboreMeasurementsMapV3 as WellboreMeasurementsMap } from '../types';
import { trimCachedDataV3 as trimCachedData } from '../utils/common';

import { useWellConfig } from './useWellConfig';

export const useMeasurementsQuery = () => {
  const wellboreMatchingIds = useWellInspectSelectedWellboreMatchingIds();
  const { data: config } = useWellConfig();
  const cache = useQueryClient();
  const [fetchingNewData, setFetchingNewData] = useState<boolean>(false);
  const metricLogger = useMetricLogger(
    LOG_MEASUREMENTS,
    TimeLogStages.Network,
    LOG_WELLS_MEASUREMENTS_NAMESPACE
  );
  const newDataMetricLogger = useMetricLogger(
    LOG_MEASUREMENTS,
    TimeLogStages.Network,
    LOG_WELLS_MEASUREMENTS_NAMESPACE
  );

  const enableApiCall = !isUndefined(config) && !isEmpty(wellboreMatchingIds);

  // Do the initial search with react-query
  const { data, isLoading } = useQuery(
    WELL_QUERY_KEY.MEASUREMENTS,
    () =>
      getMeasurementsByWellboreIds(wellboreMatchingIds, config, metricLogger),
    {
      // wait till config is loaded
      enabled: enableApiCall,
    }
  );

  if (isLoading || !enableApiCall || !data) {
    return { isLoading: true };
  }

  // Check if there are ids not in the cached data. Also filter cached data by requested ids
  const { newIds, trimmedData } = trimCachedData(data, wellboreMatchingIds);

  if (isEmpty(newIds)) {
    return { data: trimmedData as WellboreMeasurementsMap };
  }

  // If there are ids not in the cached data, do a search for new ids and update the cache
  if (newIds.length && !fetchingNewData) {
    setFetchingNewData(true);
    getMeasurementsByWellboreIds(newIds, config, newDataMetricLogger).then(
      (response) => {
        cache.setQueryData(WELL_QUERY_KEY.MEASUREMENTS, {
          ...response,
          ...data,
        });
        setFetchingNewData(false);
      }
    );
  }
  return { isLoading: true };
};
