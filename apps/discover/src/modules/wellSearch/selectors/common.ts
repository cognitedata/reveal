import { useMemo } from 'react';

import { Sequence } from '@cognite/sdk';

import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/hooks/useWellInspect';

import { SequenceData } from '../types';

import { useWellboreData } from './asset/wellbore';

export const usePristineIds = () => {
  const wbIds = useWellInspectSelectedWellboreIds();
  const wellboreData = useWellboreData();
  return useMemo(() => {
    const logPristineIds: number[] = [];
    const documentPristineIds: number[] = [];
    const logsRowPristineIds: Sequence[] = [];
    const logsFrmTopsRowPristineIds: Sequence[] = [];
    const digitalRocksPristineIds: number[] = [];

    wbIds.forEach((wbid) => {
      // Get Wellbore ids to fetch logs
      if (!wellboreData[wbid]?.logType) {
        logPristineIds.push(wbid);
      }

      if (!wellboreData[wbid]?.documents) {
        documentPristineIds.push(wbid);
      }

      // Get Logs ids to fetch logs row data
      if (wellboreData[wbid] && wellboreData[wbid].logType) {
        (wellboreData[wbid].logType as SequenceData[]).forEach((logData) => {
          if (!logData.rows) {
            logsRowPristineIds.push(logData.sequence);
          }
        });
      }

      // Get LogsFrmTops ids to fetch logsfrmTops row data
      if (wellboreData[wbid] && wellboreData[wbid].logsFrmTops) {
        (wellboreData[wbid].logsFrmTops as SequenceData[]).forEach(
          (logData) => {
            if (!logData.rows) {
              logsFrmTopsRowPristineIds.push(logData.sequence);
            }
          }
        );
      }

      // Get wellboreIds to fetch digital rocks
      if (!wellboreData[wbid]?.digitalRocks) {
        digitalRocksPristineIds.push(wbid);
      }
    });
    return {
      logPristineIds,
      logsRowPristineIds,
      logsFrmTopsRowPristineIds,
      documentPristineIds,
      digitalRocksPristineIds,
    };
  }, [wbIds, wellboreData]);
};
