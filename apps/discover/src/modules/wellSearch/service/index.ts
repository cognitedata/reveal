import {
  getAssetsByParentIds,
  getAssetsByExternalParentIds,
} from './asset/common';
import { getSequencesByAssetIds, getSequenceRowData } from './sequence/common';

export * from './sequence';
export * from './event';
export * from './asset/well';
export * from './asset/wellbore';
export * from './filters';

export const wellSearchService = {
  getSequencesByAssetIds,
  getAssetsByParentIds,
  getSequenceRowData,
  getAssetsByExternalParentIds,
};
