import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import get from 'lodash/get';

import { Sequence, Metadata } from '@cognite/sdk';

import { wellSearchActions } from 'modules/wellSearch/actions';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { SequenceData } from 'modules/wellSearch/types';

import { useSecondarySelectedOrHoveredWells } from '../asset/well';
import { useWellboreAssetIdMap, useWellboreData } from '../asset/wellbore';
import { usePristineIds } from '../common';

export const useSelectedWellBoresLOT = () => {
  const dispatch = useDispatch();
  const { data: config } = useWellConfig();
  const { lotPristineIds } = usePristineIds();
  const wellboreAssetIdMap = useWellboreAssetIdMap();
  const wells = useSecondarySelectedOrHoveredWells();
  const wellboreData = useWellboreData();
  const [isLoading, setIsLoading] = useState<boolean>();
  return useMemo(() => {
    const lots: Sequence[] = [];

    if (isLoading && !lotPristineIds.length) {
      setIsLoading(false);
    }

    if (lotPristineIds.length) {
      if (!isLoading) {
        setIsLoading(true);
        dispatch(
          wellSearchActions.getWellboreSequences(
            lotPristineIds,
            wellboreAssetIdMap,
            'lot',
            config?.lot?.fetch
          )
        );
      }
      return { isLoading: true, lots };
    }

    wells.forEach((well) => {
      if (well.wellbores) {
        well.wellbores.forEach((wellbore) => {
          (get(wellboreData[wellbore.id], 'lot') as SequenceData[]).forEach(
            (logData) => {
              const metadata: Metadata = {
                ...logData.sequence.metadata,
                wellboreName: wellbore.name,
              };
              if (wellbore.description) {
                metadata.wellboreDescription = wellbore.description;
              }
              lots.push({
                ...logData.sequence,
                metadata,
              });
            }
          );
        });
      }
    });
    return { isLoading: false, lots };
  }, [wells, wellboreData, lotPristineIds]);
};
