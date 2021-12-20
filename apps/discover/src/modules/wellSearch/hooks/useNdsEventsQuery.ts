import { useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from 'react-query';

import { Nds } from '@cognite/sdk-wells-v3';

import { LOG_EVENTS_NDS } from 'constants/logging';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { useMetricLogger, TimeLogStages } from 'hooks/useTimeLog';

import {
  useActiveWellboresSourceExternalIdMap,
  useSelectedOrHoveredWellboreIds,
} from '../selectors';
import {
  getNdsEventsByWellboreIds as service,
  fetchNdsEvents,
  fetchAllNdsEvents,
} from '../service';
import { WellboreEventsMap, WellboreSourceExternalIdMap } from '../types';
import { trimCachedData } from '../utils/common';
import { groupByWellbore } from '../utils/groupByWellbore';

import { useEnabledWellSdkV3 } from './useEnabledWellSdkV3';
import { useSmartCache } from './useSmartCache';

interface Props {
  wellboreIds: string[];
}
export const useNdsInfiniteQuery = ({ wellboreIds }: Props) => {
  return useInfiniteQuery(
    WELL_QUERY_KEY.NDS_EVENTS,
    ({ pageParam }) => {
      return fetchNdsEvents(wellboreIds as unknown as number[], pageParam);
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    }
  );
};

interface NdsAllCursorsProps {
  wellboreIds: Set<string>;
}
/*
 * This function will cache any wellboreId's you pass into it
 *
 * So if you pass in [1,2] it will cache them
 * then if you pass in [3] it will add that onto the cache
 * so the cache will now contain 3 items
 *
 */
export const useAllNdsCursorsQuery = ({ wellboreIds }: NdsAllCursorsProps) => {
  return useSmartCache<Nds>({
    key: WELL_QUERY_KEY.NDS_EVENTS_CACHE,
    items: wellboreIds,
    tempKey: WELL_QUERY_KEY.NDS_EVENTS_ALL,
    fetchAction: (items: Set<string>) =>
      fetchAllNdsEvents({ wellboreIds: items }).then((response) =>
        groupByWellbore(response)
      ),
  });
};

interface NdsQueryProps {
  wellboreIds: number[];
  wellboresSourceExternalIdMap: WellboreSourceExternalIdMap;
  enabledWellSDKV3?: boolean;
}
export const useNdsQuery = ({
  wellboreIds,
  wellboresSourceExternalIdMap,
  enabledWellSDKV3,
}: NdsQueryProps) => {
  const metricLogger = useMetricLogger(
    LOG_EVENTS_NDS,
    TimeLogStages.Network,
    LOG_EVENTS_NDS
  );

  return useQuery(
    WELL_QUERY_KEY.NDS_EVENTS,
    () => {
      return service(
        wellboreIds,
        wellboresSourceExternalIdMap,
        metricLogger,
        enabledWellSDKV3
      );
    },
    { enabled: wellboreIds.length > 0 }
  );
};

export const useNdsEventsQuery = () => {
  const enabledWellSDKV3 = useEnabledWellSdkV3();
  const wellboreIds = useSelectedOrHoveredWellboreIds();
  const wellboresSourceExternalIdMap = useActiveWellboresSourceExternalIdMap();
  const queryClient = useQueryClient();
  const [fetchingNewData, setFetchingNewData] = useState<boolean>(false);
  const { data, isLoading } = useNdsQuery({
    wellboreIds,
    wellboresSourceExternalIdMap,
    enabledWellSDKV3,
  });

  const newDataMetricLogger = useMetricLogger(
    LOG_EVENTS_NDS,
    TimeLogStages.Network,
    LOG_EVENTS_NDS
  );

  if (isLoading || !data) {
    return { isLoading: true };
  }

  // Check if there are ids not in the cached data. Also filter cached data by requested ids
  const { newIds, trimmedData } = trimCachedData(
    data as Record<string, any>,
    wellboreIds
  );
  if (newIds.length === 0) {
    return { data: trimmedData as WellboreEventsMap };
  }

  // If there are ids not in the cached data, do a search for new ids and update the cache
  if (newIds.length && !fetchingNewData) {
    setFetchingNewData(true);
    service(
      newIds,
      wellboresSourceExternalIdMap,
      newDataMetricLogger,
      enabledWellSDKV3
    ).then((response) => {
      queryClient.setQueryData(WELL_QUERY_KEY.NDS_EVENTS, {
        ...response,
        ...data,
      });
      setFetchingNewData(false);
    });
  }

  return { isLoading: true };
};
