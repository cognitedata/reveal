import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import get from 'lodash/get';

import { ITimer } from '@cognite/metrics';
import { Sequence, Metadata } from '@cognite/sdk';

import { LOG_PPFG, LOG_WELLS_PPFG_NAMESPACE } from 'constants/logging';
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

export const useSelectedWellBoresPPFG = () => {
  const dispatch = useDispatch();
  const { data: config } = useWellConfig();
  const { ppfgPristineIds } = usePristineIds();
  const wellboreAssetIdMap = useWellboreAssetIdMap();
  const wells = useSecondarySelectedOrHoveredWells();
  const wellboreData = useWellboreData();
  const [isLoading, setIsLoading] = useState<boolean>();
  const metric = useGetCogniteMetric(LOG_PPFG);
  const [networkTimer, setNetworkTimer] = useState<ITimer>();
  let preperationTimer: ITimer;
  return useMemo(() => {
    const ppfgs: Sequence[] = [];
    const tvdColumn = get(config, 'ppfg.tvdColumn', 'TVD');

    if (isLoading && !ppfgPristineIds.length) {
      setIsLoading(false);
    }

    if (ppfgPristineIds.length && isLoading) {
      return { isLoading: true, ppfgs };
    }

    if (ppfgPristineIds.length && !isLoading) {
      setIsLoading(true);
      setNetworkTimer(
        useStartTimeLogger(
          TimeLogStages.Network,
          metric,
          LOG_WELLS_PPFG_NAMESPACE
        )
      );
      dispatch(
        wellSearchActions.getWellboreSequences(
          ppfgPristineIds,
          wellboreAssetIdMap,
          'ppfg',
          config?.ppfg?.fetch
        )
      );
      return { isLoading: true, ppfgs };
    }

    useStopTimeLogger(networkTimer, { noOfWellbores: ppfgPristineIds.length });

    preperationTimer = useStartTimeLogger(
      TimeLogStages.Preperation,
      metric,
      LOG_WELLS_PPFG_NAMESPACE
    );

    wells.forEach((well) => {
      if (well.wellbores) {
        well.wellbores.forEach((wellbore) => {
          (
            get(wellboreData, `${wellbore.id}.ppfg`, []) as SequenceData[]
          ).forEach((logData) => {
            if (
              logData.sequence.columns.filter(
                (column) => column.name === tvdColumn
              ).length
            ) {
              const metadata: Metadata = {
                ...logData.sequence.metadata,
                wellboreName: wellbore.name,
              };
              if (wellbore.description) {
                metadata.wellboreDescription = wellbore.description;
              }
              ppfgs.push({
                ...logData.sequence,
                metadata,
              });
            }
          });
        });
      }
    });
    useStopTimeLogger(preperationTimer, {
      noOfWellbores: ppfgPristineIds.length,
    });
    return { isLoading: false, ppfgs };
  }, [wells, wellboreData, ppfgPristineIds]);
};

// This returns row data for given ppfgs list
export const usePPFGData = (ppfgs: Sequence[]) => {
  const wellboreData = useWellboreData();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>();
  return useMemo(() => {
    const ppfgsToFetch = ppfgs.filter((ppfg) => {
      const ppfgData = get(wellboreData, `${ppfg.assetId}.ppfg`, []).filter(
        (data: SequenceData) => data.sequence.id === ppfg.id
      );
      return ppfgData.length && !ppfgData[0].rows;
    });

    if (isLoading && !ppfgsToFetch.length) {
      setIsLoading(false);
    }

    if (ppfgsToFetch.length) {
      if (!isLoading) {
        setIsLoading(true);
        ppfgsToFetch.forEach((ppfg) => {
          dispatch(wellSearchActions.getPPFGData(ppfg));
        });
      }
      return { isLoading: true, ppfgsData: [] };
    }

    const ppfgsData = ppfgs
      .map((ppfg) => {
        const ppfgData = get(wellboreData, `${ppfg.assetId}.ppfg`, []).filter(
          (data: SequenceData) => data.sequence.id === ppfg.id
        );
        return ppfgData.length ? { ...ppfgData[0], sequence: ppfg } : undefined;
      })
      .filter((ppfgData) => get(ppfgData, 'rows', []).length);

    return { isLoading: false, ppfgsData };
  }, [ppfgs, isLoading, wellboreData]);
};
