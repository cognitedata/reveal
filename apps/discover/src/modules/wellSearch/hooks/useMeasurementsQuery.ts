/*
 * this file is only being used in v2, which will be removed in near future
 * Hence, not adding test for this.
 * */

import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import {
  LOG_MEASUREMENTS,
  LOG_WELLS_MEASUREMENTS_NAMESPACE,
} from 'constants/logging';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { useMetricLogger, TimeLogStages } from 'hooks/useTimeLog';
import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/hooks/useWellInspect';
import { useWellInspectWellboreAssetIdMap } from 'modules/wellInspect/hooks/useWellInspectIdMap';

import { getMeasurementsByWellboreIds as service } from '../service';
import { WellboreMeasurementsMap } from '../types';
import { trimCachedData } from '../utils/common';

import { useWellConfig } from './useWellConfig';

export const useMeasurementsQuery = () => {
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const { data: config } = useWellConfig();
  const wellboreAssetIdMap = useWellInspectWellboreAssetIdMap();
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

  // Do the initial search with react-query
  const { data, isLoading } = useQuery(WELL_QUERY_KEY.MEASUREMENTS, () =>
    service(wellboreIds, wellboreAssetIdMap, config, metricLogger)
  );

  if (isLoading || !data) {
    return { isLoading: true };
  }

  // Check if there are ids not in the cached data. Also filter cached data by requested ids
  const { newIds, trimmedData } = trimCachedData(data, wellboreIds);

  if (newIds.length === 0) {
    return { data: trimmedData as WellboreMeasurementsMap };
  }

  // If there are ids not in the cached data, do a search for new ids and update the cache
  if (newIds.length && !fetchingNewData) {
    setFetchingNewData(true);
    service(newIds, wellboreAssetIdMap, config, newDataMetricLogger).then(
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
