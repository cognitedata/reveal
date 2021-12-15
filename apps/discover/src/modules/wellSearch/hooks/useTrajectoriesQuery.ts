import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import isEmpty from 'lodash/isEmpty';

import { Sequence } from '@cognite/sdk';

import { LOG_TRAJECTORY } from 'constants/logging';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { useGetCogniteMetric } from 'hooks/useTimeLog';

import {
  useSelectedOrHoveredWellboreIds,
  useWellboreAssetIdMap,
  useSecondarySelectedOrHoveredWells,
  useActiveWellboresSourceExternalIdMap,
} from '../selectors';
import { getTrajectoriesByWellboreIds as service } from '../service';
import { TrajectoryData, TrajectoryRows } from '../types';
import { trimCachedData } from '../utils/common';
import { mapWellInfo } from '../utils/trajectory';

import { useEnabledWellSdkV3 } from './useEnabledWellSdkV3';
import { useWellConfig } from './useWellConfig';

export const useTrajectoriesQuery = (ignoreEmptyRows = true) => {
  const enabledWellSDKV3 = useEnabledWellSdkV3();
  const wellboreIds = useSelectedOrHoveredWellboreIds();
  const wells = useSecondarySelectedOrHoveredWells();
  const { data: config } = useWellConfig();
  const wellboreAssetIdMap = useWellboreAssetIdMap();
  const wellboresSourceExternalIdMap = useActiveWellboresSourceExternalIdMap();
  const queryClient = useQueryClient();
  const [fetchingNewData, setFetchingNewData] = useState<boolean>(false);
  const metric = useGetCogniteMetric(LOG_TRAJECTORY);
  const query = (config?.trajectory?.queries || [])[0];
  const columns = config?.trajectory?.columns;
  const trajectories: Sequence[] = [];
  const trajectoryRows: TrajectoryRows[] = [];

  if (config?.trajectory?.enabled === false) {
    return { isLoading: false, trajectories: [], trajectoryRows: [] };
  }

  // Do the initial search with react-query
  const { data, isLoading } = useQuery(WELL_QUERY_KEY.TRAJECTORIES, () =>
    service(
      wellboreIds,
      wellboreAssetIdMap,
      wellboresSourceExternalIdMap,
      query,
      columns,
      metric,
      enabledWellSDKV3
    )
  );

  return useMemo(() => {
    if (isLoading || !data) {
      return { isLoading: true, trajectories, trajectoryRows };
    }

    // Check if there are ids not in the cached data. Also filter cached data by requested ids
    const { newIds, trimmedData } = trimCachedData(data, wellboreIds);

    if (isEmpty(newIds)) {
      Object.keys(trimmedData).forEach((wellboresId) => {
        (trimmedData[wellboresId] as TrajectoryData[]).forEach(
          (trajectoryData) => {
            if (
              !ignoreEmptyRows ||
              (trajectoryData.rowData && trajectoryData.rowData.rows.length)
            ) {
              trajectories.push(trajectoryData.sequence);
              if (trajectoryData.rowData) {
                trajectoryRows.push(trajectoryData.rowData);
              }
            }
          }
        );
      });

      return {
        isLoading: false,
        trajectories: mapWellInfo(trajectories, wells),
        trajectoryRows,
      };
    }

    // If there are ids not in the cached data, do a search for new ids and update the cache
    if (newIds.length && !fetchingNewData) {
      setFetchingNewData(true);
      service(
        newIds,
        wellboreAssetIdMap,
        wellboresSourceExternalIdMap,
        query,
        columns,
        metric,
        enabledWellSDKV3
      ).then((response) => {
        queryClient.setQueryData(WELL_QUERY_KEY.TRAJECTORIES, {
          ...response,
          ...data,
        });
        setFetchingNewData(false);
      });
    }

    return { isLoading: true, trajectories, trajectoryRows };
  }, [wellboreIds, data, wellboreAssetIdMap]);
};
