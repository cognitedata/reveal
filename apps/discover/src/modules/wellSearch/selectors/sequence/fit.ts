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

export const useSelectedWellBoresFIT = () => {
  const dispatch = useDispatch();
  const { data: config } = useWellConfig();
  const { fitPristineIds } = usePristineIds();
  const wellboreAssetIdMap = useWellboreAssetIdMap();
  const wells = useSecondarySelectedOrHoveredWells();
  const wellboreData = useWellboreData();
  const [isLoading, setIsLoading] = useState<boolean>();
  return useMemo(() => {
    const fits: Sequence[] = [];

    if (isLoading && !fitPristineIds.length) {
      setIsLoading(false);
    }

    if (fitPristineIds.length) {
      if (!isLoading) {
        setIsLoading(true);
        dispatch(
          wellSearchActions.getWellboreSequences(
            fitPristineIds,
            wellboreAssetIdMap,
            'fit',
            config?.fit?.fetch
          )
        );
      }
      return { isLoading: true, fits };
    }

    wells.forEach((well) => {
      if (well.wellbores) {
        well.wellbores.forEach((wellbore) => {
          (get(wellboreData[wellbore.id], 'fit') as SequenceData[]).forEach(
            (logData) => {
              const metadata: Metadata = {
                ...logData.sequence.metadata,
                wellboreName: wellbore.name,
              };
              if (wellbore.description) {
                metadata.wellboreDescription = wellbore.description;
              }
              fits.push({
                ...logData.sequence,
                metadata,
              });
            }
          );
        });
      }
    });
    return { isLoading: false, fits };
  }, [wells, wellboreData, fitPristineIds]);
};
