import { useMemo } from 'react';

import { Sequence } from '@cognite/sdk';

import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/hooks/useWellInspect';

import { useWellboreData } from './asset/wellbore';

export const usePristineIds = () => {
  const wbIds = useWellInspectSelectedWellboreIds();
  const wellboreData = useWellboreData();
  return useMemo(() => {
    const documentPristineIds: number[] = [];
    const logsRowPristineIds: Sequence[] = [];
    const digitalRocksPristineIds: number[] = [];

    wbIds.forEach((wbid) => {
      if (!wellboreData[wbid]?.documents) {
        documentPristineIds.push(wbid);
      }

      // Get wellboreIds to fetch digital rocks
      if (!wellboreData[wbid]?.digitalRocks) {
        digitalRocksPristineIds.push(wbid);
      }
    });
    return {
      logsRowPristineIds,
      documentPristineIds,
      digitalRocksPristineIds,
    };
  }, [wbIds, wellboreData]);
};
