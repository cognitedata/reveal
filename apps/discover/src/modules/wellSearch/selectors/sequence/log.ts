import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

import get from 'lodash/get';

import {
  LOG_WELL_LOGS,
  LOG_WELLS_TRAJECTORY_NAMESPACE,
} from 'constants/logging';
import { useMetricLogger, TimeLogStages } from 'hooks/useTimeLog';
import { useWellInspectSelectedWells } from 'modules/wellInspect/hooks/useWellInspect';
import { useWellInspectWellboreAssetIdMap } from 'modules/wellInspect/hooks/useWellInspectIdMap';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { SequenceData } from 'modules/wellSearch/types';
import { LogTypeData } from 'pages/authorized/search/well/inspect/modules/logType/interfaces';

import { useWellboreData } from '../asset/wellbore';
import { usePristineIds } from '../common';
import { updateData } from '../helper';

export const useSelectedWellBoresLogs = () => {
  const { logPristineIds } = usePristineIds();
  const { data: config } = useWellConfig();
  const wells = useWellInspectSelectedWells();
  const wellboreAssetIdMap = useWellInspectWellboreAssetIdMap();
  const dispatch = useDispatch();
  const wellboreData = useWellboreData();
  const [startNetworkTimer, stopNetworkTimer] = useMetricLogger(
    LOG_WELL_LOGS,
    TimeLogStages.Network,
    LOG_WELLS_TRAJECTORY_NAMESPACE
  );
  const [startPreparationTimer, stopPreparationTimer] = useMetricLogger(
    LOG_WELL_LOGS,
    TimeLogStages.Preperation,
    LOG_WELLS_TRAJECTORY_NAMESPACE
  );
  return useMemo(() => {
    const tempData: LogTypeData[] = [];
    if (!config) {
      return { isLoading: true, logs: tempData };
    }
    if (logPristineIds.length > 0) {
      startNetworkTimer();
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
    stopNetworkTimer({ noOfWellbores: logPristineIds.length });
    startPreparationTimer();
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
    stopPreparationTimer({
      noOfWellbores: logPristineIds.length,
    });
    return { isLoading: false, logs: tempData };
  }, [logPristineIds, config]);
};

export const useLogTypes = () => {
  const { logPristineIds } = usePristineIds();
  const wells = useWellInspectSelectedWells();
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
