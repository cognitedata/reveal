import intersection from 'lodash/intersection';
import orderBy from 'lodash/orderBy';
import uniqBy from 'lodash/uniqBy';

import { TRACK_CONFIG } from 'modules/wellSearch/constants';
import { SequenceData, WellboreData } from 'modules/wellSearch/types';
import { SequenceLogType } from 'pages/authorized/search/well/inspect/modules/logType/interfaces';

import {
  GEOMECHANIC_LOG_TYPE,
  PETREL_LOG_TYPE,
  PPFG_LOG_TYPE,
} from '../constants';

const ppfgTracks = TRACK_CONFIG.filter((track) => track.type === 'PPFG').map(
  (track) => track.column
);

// This returns ppfg that has the most number of curves required by log viewer (TRACK_CONFIG)
const getMostMatchingPPFG = (wellBorePPFGs: SequenceData[] = []) => {
  const ppfgs = wellBorePPFGs.map((wellBorePPFG) => ({
    ...wellBorePPFG,
    sequence: {
      ...wellBorePPFG.sequence,
      metadata: {
        ...wellBorePPFG.sequence.metadata,
        intersectColCount: intersection(
          wellBorePPFG.sequence.columns.map((column) => column.name),
          ppfgTracks
        ).length.toString(),
      },
    },
  }));
  return orderBy(ppfgs, 'sequence.metadata.intersectColCount', 'desc')[0];
};

// Create ppfg, wellbore id mapping object to access ppfgs efficiently
export const getPPFGWellboreIdMapping = (
  logs: SequenceLogType[] = [],
  wellboreData: WellboreData
) => {
  return uniqBy(
    logs.filter((log) => log.logType === PETREL_LOG_TYPE),
    'assetId'
  ).reduce((idMap, log) => {
    const wbId = log.assetId as number;
    return {
      ...idMap,
      [wbId]: getMostMatchingPPFG(wellboreData[wbId].ppfg),
    };
  }, {} as { [key: string]: SequenceData });
};

// Create ppfg and id mapping object to access ppfgs efficiently
export const getPPFGIdMapping = (
  logs: SequenceLogType[] = [],
  wellboreData: WellboreData
) => {
  const ppfgIdMapping: { [key: string]: SequenceData } = {};
  logs
    .filter((log) => log.logType === PPFG_LOG_TYPE)
    .forEach((ppfg) => {
      const wellBorePPFGs = wellboreData[ppfg.assetId as number]
        .ppfg as SequenceData[];
      wellBorePPFGs
        .filter((wellBorePPFG) => wellBorePPFG.sequence.id === ppfg.id)
        .forEach((wellBorePPFG) => {
          ppfgIdMapping[wellBorePPFG.sequence.id] = wellBorePPFG;
        });
    });
  return ppfgIdMapping;
};

// Create geomechanic and id mapping object to access geomechanics efficiently
export const getGeomechanicIdMapping = (
  logs: SequenceLogType[] = [],
  wellboreData: WellboreData
) => {
  const geomechanicIdMapping: { [key: string]: SequenceData } = {};
  logs
    .filter((log) => log.logType === GEOMECHANIC_LOG_TYPE)
    .forEach((geomechanic) => {
      const wellBoreGeomechanics = wellboreData[geomechanic.assetId as number]
        .geomechanic as SequenceData[];
      wellBoreGeomechanics
        .filter(
          (wellBoreGeomechanic) =>
            wellBoreGeomechanic.sequence.id === geomechanic.id
        )
        .forEach((wellBoreGeomechanic) => {
          geomechanicIdMapping[wellBoreGeomechanic.sequence.id] =
            wellBoreGeomechanic;
        });
    });
  return geomechanicIdMapping;
};

// Create log and id mapping object to access logs efficiently
export const getPetrelLogIdMapping = (
  logs: SequenceLogType[] = [],
  wellboreData: WellboreData
) => {
  const logIdMapping: { [key: string]: SequenceData } = {};
  logs
    .filter((log) => log.logType === PETREL_LOG_TYPE)
    .forEach((log) => {
      const wellBoreLogs = wellboreData[log.assetId as number]
        .logType as SequenceData[];
      wellBoreLogs
        .filter((wellBoreLog) => wellBoreLog.sequence.id === log.id)
        .forEach((wellBoreLog) => {
          logIdMapping[wellBoreLog.sequence.id] = wellBoreLog;
        });
    });
  return logIdMapping;
};

// Create log and id mapping object to access logs efficiently
export const getLogFrmsTopsIdMapping = (
  logs: SequenceLogType[] = [],
  wellboreData: WellboreData
) => {
  const logFrmsTopsIdMapping: { [key: string]: SequenceData } = {};
  uniqBy(
    logs.filter((log) => log.logType === PETREL_LOG_TYPE),
    'assetId'
  ).forEach((log) => {
    const wbId = log.assetId as number;
    const wellBoreLogs = wellboreData[wbId].logsFrmTops as SequenceData[];
    if (
      wellBoreLogs.length > 0 &&
      wellBoreLogs[0].rows &&
      wellBoreLogs[0].rows.length > 0
    ) {
      [logFrmsTopsIdMapping[wbId]] = wellBoreLogs;
    }
  });
  return logFrmsTopsIdMapping;
};
