/*!
 * Copyright 2025 Cognite AS
 */
import { type CogniteExternalId, type Node3D } from '@cognite/sdk';
import { type CadModelOptions } from '../..';
import { type ThreeDModelFdmMappings } from '../../../../hooks';
import { type NodeId } from '../../../CacheProvider/types';
import { mergeMapsWithDeduplicatedNodes } from './mergeMapsWithDeduplicatedNodes';

export function getModelMappings(
  mappings: ThreeDModelFdmMappings[],
  model: CadModelOptions
): Map<CogniteExternalId, Map<NodeId, Node3D>> {
  return mappings
    .filter(
      (mapping) => mapping.modelId === model.modelId && mapping.revisionId === model.revisionId
    )
    .reduce(
      // reduce is added to avoid duplication of a models that span several pages.
      (acc, mapping) => {
        mergeMapsWithDeduplicatedNodes(acc.mappings, mapping.mappings);
        return acc;
      },
      {
        modelId: model.modelId,
        revisionId: model.revisionId,
        mappings: new Map<string, Map<NodeId, Node3D>>()
      }
    ).mappings;
}
