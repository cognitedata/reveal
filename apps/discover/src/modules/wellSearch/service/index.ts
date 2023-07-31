import { getSequencesByAssetIds, getSequenceRowData } from './sequence/common';

export * from './sequence';
export * from './filters';

export const wellSearchService = {
  getSequencesByAssetIds,
  getSequenceRowData,
};
