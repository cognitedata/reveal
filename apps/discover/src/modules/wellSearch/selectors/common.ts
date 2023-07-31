import { useMemo } from 'react';

import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/selectors';
import { Sequence } from 'modules/wellSearch/types';

import { useWellboreData } from './wellbore';

export const usePristineIds = () => {
  const wbIds = useWellInspectSelectedWellboreIds();
  const wellboreData = useWellboreData();
  return useMemo(() => {
    const documentPristineIds: string[] = [];
    const logsRowPristineIds: Sequence[] = [];
    const digitalRocksPristineIds: string[] = [];

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
