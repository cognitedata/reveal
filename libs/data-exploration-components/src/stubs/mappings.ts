import { BasicMapping } from '@data-exploration-lib/domain-layer';

import { threeDModels } from './threeDModels';

export const mappings: BasicMapping[] = threeDModels.map(({ id: modelId }) => ({
  modelId,
  revisionId: modelId + 10000,
  nodeId: modelId + 20000,
}));
