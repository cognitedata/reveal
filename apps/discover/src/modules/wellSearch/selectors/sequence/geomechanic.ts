import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import get from 'lodash/get';

import { ITimer } from '@cognite/metrics';
import { Sequence } from '@cognite/sdk';

import {
  LOG_GEOMECHANICS,
  LOG_WELLS_GEOMECHANICS_NAMESPACE,
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

import { useSecondarySelectedOrHoveredWells } from '../asset/well';
import { useWellboreAssetIdMap, useWellboreData } from '../asset/wellbore';
import { usePristineIds } from '../common';

export const useSelectedWellBoresGeomechanic = () => {
  const dispatch = useDispatch();
  const { data: config } = useWellConfig();
  const { geomechanicsPristineIds } = usePristineIds();
  const wellboreAssetIdMap = useWellboreAssetIdMap();
  const wells = useSecondarySelectedOrHoveredWells();
  const wellboreData = useWellboreData();
  const [isLoading, setIsLoading] = useState<boolean>();
  const metric = useGetCogniteMetric(LOG_GEOMECHANICS);
  const [networkTimer, setNetworkTimer] = useState<ITimer>();
  let preperationTimer: ITimer;
  return useMemo(() => {
    const geomechanics: Sequence[] = [];

    if (isLoading && !geomechanicsPristineIds.length) {
      setIsLoading(false);
    }

    if (geomechanicsPristineIds.length && isLoading) {
      return { isLoading: true, geomechanics };
    }

    if (geomechanicsPristineIds.length && !isLoading) {
      setNetworkTimer(
        useStartTimeLogger(
          TimeLogStages.Network,
          metric,
          LOG_WELLS_GEOMECHANICS_NAMESPACE
        )
      );
      setIsLoading(true);
      dispatch(
        wellSearchActions.getWellboreSequences(
          geomechanicsPristineIds,
          wellboreAssetIdMap,
          'geomechanic',
          config?.geomechanic?.fetch
        )
      );
      return { isLoading: true, geomechanics };
    }

    useStopTimeLogger(networkTimer, {
      noOfWellbores: geomechanicsPristineIds.length,
    });

    preperationTimer = useStartTimeLogger(
      TimeLogStages.Preperation,
      metric,
      LOG_WELLS_GEOMECHANICS_NAMESPACE
    );
    wells.forEach((well) => {
      if (well.wellbores) {
        well.wellbores.forEach((wellbore) => {
          (
            get(
              wellboreData,
              `${wellbore.id}.geomechanic`,
              []
            ) as SequenceData[]
          ).forEach((logData) => {
            geomechanics.push(logData.sequence);
          });
        });
      }
    });
    useStopTimeLogger(preperationTimer, {
      noOfWellbores: geomechanicsPristineIds.length,
    });
    return { isLoading: false, geomechanics };
  }, [wells, wellboreData, geomechanicsPristineIds]);
};
