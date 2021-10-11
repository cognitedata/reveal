import { useMemo } from 'react';

import { Sequence } from '@cognite/sdk';

import { SequenceData } from '../types';

import {
  useSelectedOrHoveredWellboreIds,
  useWellboreData,
} from './asset/wellbore';

export const usePristineIds = () => {
  const wbIds = useSelectedOrHoveredWellboreIds();
  const wellboreData = useWellboreData();
  return useMemo(() => {
    const logPristineIds: number[] = [];
    const ppfgPristineIds: number[] = [];
    const documentPristineIds: number[] = [];
    const fitPristineIds: number[] = [];
    const lotPristineIds: number[] = [];
    const geomechanicsPristineIds: number[] = [];
    const logsRowPristineIds: Sequence[] = [];
    const logsFrmTopsRowPristineIds: Sequence[] = [];
    const digitalRocksPristineIds: number[] = [];

    wbIds.forEach((wbid) => {
      // Get Wellbore ids to fetch logs
      if (!wellboreData[wbid]?.logType) {
        logPristineIds.push(wbid);
      }

      // Get Wellbore ids to fetch PPFG
      if (!wellboreData[wbid]?.ppfg) {
        ppfgPristineIds.push(wbid);
      }

      // Get Wellbore ids to fetch FIT
      if (!wellboreData[wbid]?.fit) {
        fitPristineIds.push(wbid);
      }

      if (!wellboreData[wbid]?.documents) {
        documentPristineIds.push(wbid);
      }
      // Get Wellbore ids to fetch LOT
      if (!wellboreData[wbid]?.lot) {
        lotPristineIds.push(wbid);
      }

      // Get Wellbore ids to fetch Geomechanics
      if (!wellboreData[wbid]?.geomechanic) {
        geomechanicsPristineIds.push(wbid);
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
      ppfgPristineIds,
      fitPristineIds,
      lotPristineIds,
      geomechanicsPristineIds,
      logsRowPristineIds,
      logsFrmTopsRowPristineIds,
      documentPristineIds,
      digitalRocksPristineIds,
    };
  }, [wbIds, wellboreData]);
};
