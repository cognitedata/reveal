/*!
 * Copyright 2025 Cognite AS
 */
import { IndexSet } from '@cognite/reveal';
import { type Node3D } from '@cognite/sdk';
import { type HybridFdmAssetStylingGroup, type CadModelOptions } from '../..';
import { type ThreeDModelFdmMappings } from '../../../../hooks';
import { createFdmKey } from '../../../CacheProvider/idAndKeyTranslation';
import { type NodeId } from '../../../CacheProvider/types';
import { type TreeIndexStylingGroup } from '../../../CadModelContainer';
import { getNodeSubtreeNumericRange } from './getNodeSubtreeNumericRange';
import { getModelMappings } from './getModelMappings';

export function calculateHybridAssetMappingCadModelStyling(
  stylingGroups: HybridFdmAssetStylingGroup[],
  mappings: ThreeDModelFdmMappings[],
  model: CadModelOptions
): TreeIndexStylingGroup[] {
  const modelMappings = getModelMappings(mappings, model);

  return stylingGroups
    .map((resourcesGroup) => {
      const modelMappedNodeLists = resourcesGroup.hybridFdmAssetExternalIds
        .map((uniqueId) => modelMappings.get(createFdmKey(uniqueId)))
        .filter((nodeMap): nodeMap is Map<NodeId, Node3D> => nodeMap !== undefined)
        .map((nodeMap) => [...nodeMap.values()]);

      const indexSet = new IndexSet();
      modelMappedNodeLists.forEach((nodes) => {
        nodes.forEach((n) => {
          indexSet.addRange(getNodeSubtreeNumericRange(n));
        });
      });

      return {
        style: resourcesGroup.style.cad,
        treeIndexSet: indexSet
      };
    })
    .filter((group) => group.treeIndexSet.count > 0);
}
