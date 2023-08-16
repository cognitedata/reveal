/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteCadModel } from '@cognite/reveal';
import { useFdm3dNodeData } from '../components/NodeCacheProvider/NodeCacheProvider';
import { Fdm3dNodeData } from '../components/NodeCacheProvider/RevisionNodeCache';

export const useNodeMappedData = (
  treeIndex: number | undefined,
  model: CogniteCadModel | undefined
): Fdm3dNodeData[] => {
  const nodeCacheContent = useFdm3dNodeData(model?.modelId, model?.revisionId, treeIndex);

  return nodeCacheContent.data ?? [];
};
