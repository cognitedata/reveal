import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { LOG_CASING } from 'constants/logging';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { useGetCogniteMetric } from 'hooks/useTimeLog';

import {
  useSelectedOrHoveredWellboreIds,
  useWellboreAssetIdMap,
} from '../selectors';
import { getCasingByWellboreIds as service } from '../service';
import { WellboreSequencesMap } from '../types';
import { trimCachedData } from '../utils/common';

import { useWellConfig } from './useWellConfig';

export const useSelectedWellboresCasingsQuery = () => {
  const wellboreIds = useSelectedOrHoveredWellboreIds();
  const { data: config } = useWellConfig();
  const wellboreAssetIdMap = useWellboreAssetIdMap();
  const cache = useQueryClient();
  const [fetchingNewData, setFetchingNewData] = useState<boolean>(false);
  const metric = useGetCogniteMetric(LOG_CASING);

  // Do the initial search with react-query
  const { data, isLoading } = useQuery(WELL_QUERY_KEY.CASINGS, () =>
    service(
      wellboreIds,
      wellboreAssetIdMap,
      config?.casing?.queries?.[0],
      metric
    )
  );

  if (isLoading || !data) {
    return { isLoading: true };
  }

  // Check if there are ids not in the cached data. Also filter cached data by requested ids
  const { newIds, trimmedData } = trimCachedData(data, wellboreIds);
  if (newIds.length === 0) {
    return { data: trimmedData as WellboreSequencesMap };
  }

  // If there are ids not in the cached data, do a search for new ids and update the cache
  if (newIds.length && !fetchingNewData) {
    setFetchingNewData(true);
    service(
      newIds,
      wellboreAssetIdMap,
      config?.casing?.queries?.[0],
      metric
    ).then((response) => {
      cache.setQueryData(WELL_QUERY_KEY.CASINGS, {
        ...response,
        ...data,
      });
      setFetchingNewData(false);
    });
  }

  return { isLoading: true };
};
