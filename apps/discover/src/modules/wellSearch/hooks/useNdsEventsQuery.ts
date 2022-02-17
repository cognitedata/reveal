import { useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from 'react-query';

import { LOG_EVENTS_NDS } from 'constants/logging';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { useMetricLogger, TimeLogStages } from 'hooks/useTimeLog';
import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/hooks/useWellInspect';
import { useWellInspectWellboreExternalIdMap } from 'modules/wellInspect/hooks/useWellInspectIdMap';

import {
  getNdsEventsByWellboreIds as service,
  fetchNdsEvents,
} from '../service';
import { WellboreEventsMap, WellboreSourceExternalIdMap } from '../types';
import { trimCachedData } from '../utils/common';

import { useEnabledWellSdkV3 } from './useEnabledWellSdkV3';

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
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const wellboresSourceExternalIdMap = useWellInspectWellboreExternalIdMap();
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
    return { data: trimmedData as WellboreEventsMap, isLoading: false };
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
