import React from 'react';
import { useQuery, useQueryClient, UseQueryResult } from 'react-query';

import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';
import { useTrajectoryQueriesFiltersByKey } from 'modules/wellInspect/hooks/useTrajectoryQueriesFiltersByKey';
import { WellSequenceData } from 'modules/wellInspect/types';
import { selectObjectsByKey } from 'modules/wellInspect/utils';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { WellboreId } from 'modules/wellSearch/types';

import { useFetchSequenceData } from './useFetchSequenceData';

export const useWellFormationTopsQuery = (
  requiredWellboreIds: WellboreId[] = []
): UseQueryResult<WellSequenceData> => {
  const queryClient = useQueryClient();
  const { data: wellConfig } = useWellConfig();
  const filters = useTrajectoryQueriesFiltersByKey('logsFrmTops');
  const fetchSequenceData = useFetchSequenceData();

  const wellFormationTops =
    queryClient.getQueryData<WellSequenceData>(WELL_QUERY_KEY.FORMATION_TOPS) ||
    {};

  const prestineWellboreIds = useDeepMemo(() => {
    const wellFormationTopsFetchedWellboreIds = Object.keys(wellFormationTops);
    return difference(requiredWellboreIds, wellFormationTopsFetchedWellboreIds);
  }, [requiredWellboreIds]);

  const updateWellFormationTopsForPrestineWellboreIds = async () => {
    if (isEmpty(prestineWellboreIds)) {
      return wellFormationTops;
    }
    const updatedWellLogs: WellSequenceData = {
      ...wellFormationTops,
      ...(await fetchSequenceData(prestineWellboreIds, filters)),
    };
    queryClient.setQueryData(WELL_QUERY_KEY.FORMATION_TOPS, updatedWellLogs);
    return updatedWellLogs;
  };

  useDeepEffect(() => {
    updateWellFormationTopsForPrestineWellboreIds();
  }, [prestineWellboreIds]);

  return useQuery<WellSequenceData>(
    WELL_QUERY_KEY.FORMATION_TOPS,
    updateWellFormationTopsForPrestineWellboreIds,
    {
      enabled: wellConfig?.disabled !== true,
      select: React.useCallback(
        (wellFormationTops) => {
          return selectObjectsByKey(wellFormationTops, requiredWellboreIds);
        },
        [requiredWellboreIds]
      ),
    }
  );
};
