import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { LOG_EVENTS_NPT } from 'constants/logging';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { useGetCogniteMetric } from 'hooks/useTimeLog';

import { useActiveWellboresExternalIdMap } from '../selectors';
import { getNptEventsByWellboreIds as service } from '../service';
import { WellboreNPTEventsMap } from '../types';
import { trimCachedData } from '../utils/common';

export const useNptEventsQuery = () => {
  const wellboreExternalIdMap = useActiveWellboresExternalIdMap();
  const queryClient = useQueryClient();
  const [fetchingNewData, setFetchingNewData] = useState<boolean>(false);
  const metric = useGetCogniteMetric(LOG_EVENTS_NPT);

  // Do the initial search with react-query
  const { data, isLoading } = useQuery(WELL_QUERY_KEY.NPT_EVENTS, () =>
    service(wellboreExternalIdMap, metric)
  );

  if (isLoading || !data) {
    return { isLoading: true };
  }

  // Check if there are ids not in the cached data. Also filter cached data by requested ids
  const { newIds, trimmedData } = trimCachedData(
    data,
    Object.values(wellboreExternalIdMap)
  );
  if (newIds.length === 0) {
    return { data: trimmedData as WellboreNPTEventsMap };
  }

  // If there are ids not in the cached data, do a search for new ids and update the cache
  if (newIds.length && !fetchingNewData) {
    setFetchingNewData(true);
    service(wellboreExternalIdMap, metric).then((response) => {
      queryClient.setQueryData(WELL_QUERY_KEY.NPT_EVENTS, {
        ...response,
        ...data,
      });
      setFetchingNewData(false);
    });
  }

  return { isLoading: true };
};
