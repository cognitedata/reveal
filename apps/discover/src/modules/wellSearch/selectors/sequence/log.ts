import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import get from 'lodash/get';

import { ITimer } from '@cognite/metrics';

import {
  LOG_WELL_LOGS,
  LOG_WELLS_TRAJECTORY_NAMESPACE,
} from 'constants/logging';
import {
  useGetCogniteMetric,
  useStartTimeLogger,
  useStopTimeLogger,
  TimeLogStages,
} from 'hooks/useTimeLog';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { SequenceData } from 'modules/wellSearch/types';
import { LogTypeData } from 'pages/authorized/search/well/inspect/modules/logType/interfaces';

import { useSecondarySelectedOrHoveredWells } from '../asset/well';
import { useWellboreAssetIdMap, useWellboreData } from '../asset/wellbore';
import { usePristineIds } from '../common';
import { updateData } from '../helper';

export const useSelectedWellBoresLogs = () => {
  const { logPristineIds } = usePristineIds();
  const { data: config } = useWellConfig();
  const wells = useSecondarySelectedOrHoveredWells();
  const wellboreAssetIdMap = useWellboreAssetIdMap();
  const dispatch = useDispatch();
  const wellboreData = useWellboreData();
  const metric = useGetCogniteMetric(LOG_WELL_LOGS);
  const [networkTimer, setNetworkTimer] = useState<ITimer>();
  let preperationTimer: ITimer;
  return useMemo(() => {
    const tempData: LogTypeData[] = [];
    if (!config) {
      return { isLoading: true, logs: tempData };
    }
    if (logPristineIds.length > 0) {
      setNetworkTimer(
        useStartTimeLogger(
          TimeLogStages.Network,
          metric,
          LOG_WELLS_TRAJECTORY_NAMESPACE
        )
      );
      dispatch(
        wellSearchActions.getLogType(
          logPristineIds,
          wellboreAssetIdMap,
          config?.logs?.queries,
          config?.logs?.types
        )
      );
      return { isLoading: true, logs: tempData };
    }
    useStopTimeLogger(networkTimer, { noOfWellbores: logPristineIds.length });
    preperationTimer = useStartTimeLogger(
      TimeLogStages.Preperation,
      metric,
      LOG_WELLS_TRAJECTORY_NAMESPACE
    );
    wells.forEach((well) => {
      if (well.wellbores) {
        well.wellbores.forEach((wellbore) => {
          (get(wellboreData[wellbore.id], 'logType') as SequenceData[]).forEach(
            (logData) => {
              const { sequence } = logData;
              updateData(tempData, well, wellbore, 'logType', sequence);
            }
          );
        });
      }
    });
    useStopTimeLogger(preperationTimer, {
      noOfWellbores: logPristineIds.length,
    });
    return { isLoading: false, logs: tempData };
  }, [logPristineIds, config]);
};

export const useLogTypes = () => {
  const { logPristineIds } = usePristineIds();
  const wells = useSecondarySelectedOrHoveredWells();
  const wellboreData = useWellboreData();
  return useMemo(() => {
    const tempData: LogTypeData[] = [];
    if (logPristineIds.length > 0) return tempData;
    wells.forEach((well) => {
      if (well.wellbores) {
        well.wellbores.forEach((wellbore) => {
          const data = get(
            wellboreData[wellbore.id],
            'logType'
          ) as SequenceData[];
          if (data) {
            data.forEach((logData) => {
              const { sequence } = logData;
              updateData(tempData, well, wellbore, 'logType', sequence);
            });
          }
        });
      }
    });
    return tempData;
  }, [wells, wellboreData, logPristineIds]);
};
