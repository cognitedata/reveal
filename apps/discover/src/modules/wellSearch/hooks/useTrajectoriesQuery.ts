import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import isEmpty from 'lodash/isEmpty';

import { Sequence } from '@cognite/sdk';

import {
  LOG_TRAJECTORY,
  LOG_WELLS_TRAJECTORY_NAMESPACE,
} from 'constants/logging';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { useMetricLogger, TimeLogStages } from 'hooks/useTimeLog';

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

// NOTE: ignoreEmptyRows seems to always be true everywhere, perhaps we should remove this option
export const useTrajectoriesQuery = (ignoreEmptyRows = true) => {
  const enabledWellSDKV3 = useEnabledWellSdkV3();
  const wellboreIds = useSelectedOrHoveredWellboreIds();
  const wells = useSecondarySelectedOrHoveredWells();
  const { data: config } = useWellConfig();
  const wellboreAssetIdMap = useWellboreAssetIdMap();
  const wellboresSourceExternalIdMap = useActiveWellboresSourceExternalIdMap();
  const queryClient = useQueryClient();
  const [fetchingNewData, setFetchingNewData] = useState<boolean>(false);
  const query = (config?.trajectory?.queries || [])[0];
  const columns = config?.trajectory?.columns;
  const trajectories: Sequence[] = [];
  const trajectoryRows: TrajectoryRows[] = [];
  const isTrajectoriesDisabled = config?.trajectory?.enabled === false; // checking false because we want to fetch for undefined
  const metricLogger = useMetricLogger(
    LOG_TRAJECTORY,
    TimeLogStages.Network,
    LOG_WELLS_TRAJECTORY_NAMESPACE
  );
  const newDataMetricLogger = useMetricLogger(
    LOG_TRAJECTORY,
    TimeLogStages.Network,
    LOG_WELLS_TRAJECTORY_NAMESPACE
  );

  // Do the initial search with react-query
  const { data, isLoading } = useQuery(
    WELL_QUERY_KEY.TRAJECTORIES,
    () =>
      service(
        wellboreIds,
        wellboreAssetIdMap,
        wellboresSourceExternalIdMap,
        query,
        columns,
        metricLogger,
        enabledWellSDKV3
      ),
    { enabled: !isTrajectoriesDisabled }
  );

  return useMemo(() => {
    if (isLoading || !data) {
      return { isLoading, trajectories, trajectoryRows };
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
        newDataMetricLogger,
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
  }, [wellboreIds, isLoading, data, wellboreAssetIdMap, enabledWellSDKV3]);
};
