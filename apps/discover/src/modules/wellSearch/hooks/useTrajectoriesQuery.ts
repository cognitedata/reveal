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
  useWellInspectSelectedWellboreIds,
  useWellInspectSelectedWells,
} from 'modules/wellInspect/hooks/useWellInspect';
import { useWellInspectWellboreExternalIdMap } from 'modules/wellInspect/hooks/useWellInspectIdMap';

import {
  getTrajectoriesByWellboreIds,
  listTrajectoriesUsingWellsSDK,
} from '../service';
import { TrajectoryData, TrajectoryRows } from '../types';
import { trimCachedData } from '../utils/common';
import { mapWellInfo } from '../utils/trajectory';

import { useWellConfig } from './useWellConfig';

export const useTrajectoriesMetadataQuery = () => {
  const wellboreIds = useWellInspectSelectedWellboreIds();

  const trajectoriesMetadata = useQuery(
    [WELL_QUERY_KEY.TRAJECTORIES_LIST, wellboreIds],
    async () => {
      return listTrajectoriesUsingWellsSDK(wellboreIds);
    }
  );

  return trajectoriesMetadata;
};

// NOTE: ignoreEmptyRows seems to always be true everywhere, perhaps we should remove this option
export const useTrajectoriesQuery = (enabled = true) => {
  const queryClient = useQueryClient();

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

  const wellboreIds = useWellInspectSelectedWellboreIds();
  const wells = useWellInspectSelectedWells();
  const wellboresSourceExternalIdMap = useWellInspectWellboreExternalIdMap();
  const [fetchingNewData, setFetchingNewData] = useState<boolean>(false);

  const { data: config } = useWellConfig();
  const columns = config?.trajectory?.columns;
  const isTrajectoriesDisabled = config?.trajectory?.enabled === false; // checking false because we want to fetch for undefined

  const trajectories: Sequence[] = [];
  const trajectoryRows: TrajectoryRows[] = [];

  // Do the initial search with react-query
  const { data, isLoading } = useQuery(
    WELL_QUERY_KEY.TRAJECTORIES,
    () =>
      getTrajectoriesByWellboreIds(
        wellboreIds,
        wellboresSourceExternalIdMap,
        columns,
        metricLogger
      ),
    { enabled: !isTrajectoriesDisabled && enabled }
  );

  return useMemo(() => {
    if (isLoading || !data || !enabled) {
      return { isLoading, trajectories, trajectoryRows };
    }

    // Check if there are ids not in the cached data. Also filter cached data by requested ids
    const { newIds, trimmedData } = trimCachedData(data, wellboreIds);

    if (isEmpty(newIds)) {
      Object.keys(trimmedData).forEach((wellboresId) => {
        (trimmedData[wellboresId] as TrajectoryData[]).forEach(
          (trajectoryData) => {
            if (trajectoryData.rowData && trajectoryData.rowData.rows.length) {
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
      getTrajectoriesByWellboreIds(
        newIds,
        wellboresSourceExternalIdMap,
        columns,
        newDataMetricLogger
      ).then((response) => {
        queryClient.setQueryData(WELL_QUERY_KEY.TRAJECTORIES, {
          ...response,
          ...data,
        });
        setFetchingNewData(false);
      });
    }

    return { isLoading: true, trajectories, trajectoryRows };
  }, [wellboreIds, isLoading, data, enabled]);
};
