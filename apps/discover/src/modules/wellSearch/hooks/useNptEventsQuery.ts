import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { LOG_EVENTS_NPT, LOG_EVENTS_NDS } from 'constants/logging';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { useMetricLogger, TimeLogStages } from 'hooks/useTimeLog';
import { useWellInspectWellboreIdMap } from 'modules/wellInspect/hooks/useWellInspectIdMap';

import { getNptEventsByWellboreIds as service } from '../service';
import { WellboreNPTEventsMap } from '../types';
import { trimCachedData } from '../utils/common';

export const useNptEventsQuery = () => {
  const wellboresMatchingIdMap = useWellInspectWellboreIdMap();
  const queryClient = useQueryClient();
  const [fetchingNewData, setFetchingNewData] = useState<boolean>(false);
  const metricLogger = useMetricLogger(
    LOG_EVENTS_NPT,
    TimeLogStages.Network,
    LOG_EVENTS_NDS
  );
  const newDataMetricLogger = useMetricLogger(
    LOG_EVENTS_NPT,
    TimeLogStages.Network,
    LOG_EVENTS_NDS
  );

  // Do the initial search with react-query
  const { data, isLoading } = useQuery(WELL_QUERY_KEY.NPT_EVENTS, () =>
    Promise.all(
      Object.entries(wellboresMatchingIdMap).map(([matchingId, id]) =>
        service({ [matchingId]: id as number }, metricLogger)
      )
    ).then((response) =>
      response.reduce(
        (joinedResponse, wellboreResponse) => ({
          ...joinedResponse,
          ...wellboreResponse,
        }),
        {}
      )
    )
  );

  if (isLoading || !data) {
    return { isLoading: true };
  }

  // Check if there are ids not in the cached data. Also filter cached data by requested ids
  const wellboreMatchingIds = Object.values(wellboresMatchingIdMap);
  const { newIds, trimmedData } = trimCachedData(data, wellboreMatchingIds);
  if (newIds.length === 0) {
    return { data: trimmedData as WellboreNPTEventsMap };
  }

  // If there are ids not in the cached data, do a search for new ids and update the cache
  if (newIds.length && !fetchingNewData) {
    setFetchingNewData(true);
    Promise.all(
      Object.entries(wellboresMatchingIdMap)
        .filter(([_, id]) => newIds.includes(id))
        .map(([matchingId, id]) =>
          service({ [matchingId]: id as number }, newDataMetricLogger)
        )
    ).then((response) => {
      queryClient.setQueryData(WELL_QUERY_KEY.NPT_EVENTS, {
        ...response.reduce(
          (joinedResponse, wellboreResponse) => ({
            ...joinedResponse,
            ...wellboreResponse,
          }),
          {}
        ),
        ...data,
      });
      setFetchingNewData(false);
    });
  }

  return { isLoading: true };
};
