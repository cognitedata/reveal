import {
  getAssetsByParentIds,
  getAssetsByExternalParentIds,
} from './asset/common';
import {
  getSequenceByWellboreIds,
  getSequencesByAssetIds,
  getSequenceRowData,
} from './sequence/common';
import { getLogsDataByLogs } from './sequence/logs';

export * from './sequence';
export * from './event';
export * from './asset/well';
export * from './asset/wellbore';
export * from './filters';

export const wellSearchService = {
  getSequenceByWellboreIds,
  getLogsDataByLogs,
  getSequencesByAssetIds,
  getAssetsByParentIds,
  getSequenceRowData,
  getAssetsByExternalParentIds,
};
