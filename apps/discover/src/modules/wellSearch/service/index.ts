import { getSequencesByAssetIds, getSequenceRowData } from './sequence/common';

export * from './sequence';
export * from './event';
export * from './filters';

export const wellSearchService = {
  getSequencesByAssetIds,
  getSequenceRowData,
};
