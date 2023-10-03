import { Vector3 } from 'three';

import { Cognite3DViewer, CogniteModel } from '@cognite/reveal';
import { ThreeDModelMappings } from '@cognite/reveal-react-components/dist/hooks/types';
import { BoundingBox3D } from '@cognite/sdk';

export function getBoundingBoxCenter(boundingBox: BoundingBox3D) {
  const min = new Vector3().fromArray(boundingBox.min);
  const max = new Vector3().fromArray(boundingBox.max);

  return max.sub(min).multiplyScalar(0.5).add(min);
}

export function getCogniteModel(
  viewer: Cognite3DViewer,
  modelId: number,
  revisionId: number
): CogniteModel | undefined {
  return viewer.models.find(
    (model) => model.modelId === modelId && model.revisionId === revisionId
  );
}

export function getNodesFromModelsMappings(
  externalId = '',
  mappings?: ThreeDModelMappings[]
) {
  const selectedModelMappings = mappings?.find(
    (modelMappings) => modelMappings.mappings.get(externalId) !== undefined
  );

  const nodes = selectedModelMappings?.mappings.get(externalId);

  if (!selectedModelMappings || !nodes) return undefined;

  return {
    nodes,
    modelId: selectedModelMappings.modelId,
    revisionId: selectedModelMappings.revisionId,
  };
}

export function createInstanceIfDefined(
  externalId: string | undefined,
  space: string | undefined
) {
  if (externalId === undefined || space === undefined) {
    return undefined;
  }

  return { externalId, space };
}
