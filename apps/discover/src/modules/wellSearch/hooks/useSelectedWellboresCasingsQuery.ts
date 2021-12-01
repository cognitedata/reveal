import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { ProjectConfigGeneral } from '@cognite/discover-api-types';

import { LOG_CASING } from 'constants/logging';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { useGetCogniteMetric } from 'hooks/useTimeLog';

import {
  useActiveWellboresSourceExternalIdMap,
  useSelectedOrHoveredWellboreIds,
  useWellboreAssetIdMap,
} from '../selectors';
import { getCasingByWellboreIds as service } from '../service';
import { WellboreSequencesMap } from '../types';
import { trimCachedData } from '../utils/common';

import { useWellConfig } from './useWellConfig';

export const useSelectedWellboresCasingsQuery = () => {
  const { data: enableWellSDKV3 } = useProjectConfigByKey<
    ProjectConfigGeneral['enableWellSDKV3']
  >('general.enableWellSDKV3');
  const wellboreIds = useSelectedOrHoveredWellboreIds();
  const { data: config } = useWellConfig();
  const wellboreAssetIdMap = useWellboreAssetIdMap();
  const wellboresSourceExternalIdMap = useActiveWellboresSourceExternalIdMap();
  const cache = useQueryClient();
  const [fetchingNewData, setFetchingNewData] = useState<boolean>(false);
  const metric = useGetCogniteMetric(LOG_CASING);

  // Do the initial search with react-query
  const { data, isLoading } = useQuery(WELL_QUERY_KEY.CASINGS, () =>
    service(
      wellboreIds,
      wellboreAssetIdMap,
      wellboresSourceExternalIdMap,
      config?.casing?.queries?.[0],
      metric,
      enableWellSDKV3
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
      wellboresSourceExternalIdMap,
      config?.casing?.queries?.[0],
      metric,
      enableWellSDKV3
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
