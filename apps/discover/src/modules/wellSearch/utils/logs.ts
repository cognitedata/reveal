import uniqBy from 'lodash/uniqBy';

import { SequenceData, WellboreData } from 'modules/wellSearch/types';
import { SequenceLogType } from 'pages/authorized/search/well/inspect/modules/logType/interfaces';

import { PETREL_LOG_TYPE } from '../constants';

// Create log and id mapping object to access logs efficiently
export const getPetrelLogIdMapping = (
  logs: SequenceLogType[] = [],
  wellboreData: WellboreData = {}
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
  wellboreData: WellboreData = {}
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
