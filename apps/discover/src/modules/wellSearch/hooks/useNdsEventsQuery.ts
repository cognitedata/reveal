import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { LOG_EVENTS_NDS } from 'constants/logging';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { useTenantConfigByKey } from 'hooks/useTenantConfig';
import { useGetCogniteMetric } from 'hooks/useTimeLog';

import {
  useActiveWellboresSourceExternalIdMap,
  useSelectedOrHoveredWellboreIds,
} from '../selectors';
import { getNdsEventsByWellboreIds as service } from '../service';
import { WellboreEventsMap } from '../types';
import { trimCachedData } from '../utils/common';

export const useNdsEventsQuery = () => {
  const { data: enableWellSDKV3 } =
    useTenantConfigByKey<boolean>('enableWellSDKV3');
  const wellboreIds = useSelectedOrHoveredWellboreIds();
  const wellboresSourceExternalIdMap = useActiveWellboresSourceExternalIdMap();
  const queryClient = useQueryClient();
  const [fetchingNewData, setFetchingNewData] = useState<boolean>(false);
  const metric = useGetCogniteMetric(LOG_EVENTS_NDS);

  // Do the initial search with react-query
  const { data, isLoading } = useQuery(WELL_QUERY_KEY.NDS_EVENTS, () =>
    service(wellboreIds, wellboresSourceExternalIdMap, metric, enableWellSDKV3)
  );

  if (isLoading || !data) {
    return { isLoading: true };
  }

  // Check if there are ids not in the cached data. Also filter cached data by requested ids
  const { newIds, trimmedData } = trimCachedData(data, wellboreIds);
  if (newIds.length === 0) {
    return { data: trimmedData as WellboreEventsMap };
  }

  // If there are ids not in the cached data, do a search for new ids and update the cache
  if (newIds.length && !fetchingNewData) {
    setFetchingNewData(true);
    service(newIds, wellboresSourceExternalIdMap, metric, enableWellSDKV3).then(
      (response) => {
        queryClient.setQueryData(WELL_QUERY_KEY.NDS_EVENTS, {
          ...response,
          ...data,
        });
        setFetchingNewData(false);
      }
    );
  }

  return { isLoading: true };
};
