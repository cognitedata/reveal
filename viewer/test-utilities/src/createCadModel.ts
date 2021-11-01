/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DModel } from '../../core/src/public/migration/Cognite3DModel';
import { NodesLocalClient } from '@reveal/nodes-api';
import { CadMaterialManager, CadNode } from '@reveal/rendering';

import { createCadModelMetadata } from './createCadModelMetadata';
import { generateSectorTree } from './createSectorMetadata';

export function createCadModel(modelId: number, revisionId: number, depth: number = 3, children: number = 3 ): Cognite3DModel {
  const materialManager = new CadMaterialManager();
  const cadRoot = generateSectorTree(depth, children);
  const cadMetadata = createCadModelMetadata(cadRoot);
  materialManager.addModelMaterials(cadMetadata.modelIdentifier, cadMetadata.scene.maxTreeIndex);

  const cadNode = new CadNode(cadMetadata, materialManager);
  const apiClient = new NodesLocalClient();
  const model = new Cognite3DModel(modelId, revisionId, cadNode, apiClient);
  
  return model;
}
