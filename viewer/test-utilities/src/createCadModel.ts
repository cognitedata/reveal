/*!
 * Copyright 2021 Cognite AS
 */
import { V8SectorRepository } from '../../packages/sector-loader';
import { CadNode, Cognite3DModel } from '../../packages/cad-model';
import { NodesLocalClient } from '../../packages/nodes-api';
import { CadMaterialManager } from '../../packages/rendering';

import { createCadModelMetadata } from './createCadModelMetadata';
import { generateV8SectorTree } from './createSectorMetadata';

import { Mock } from 'moq.ts';

export function createCadModel(
  modelId: number,
  revisionId: number,
  depth: number = 3,
  children: number = 3
): Cognite3DModel {
  const materialManager = new CadMaterialManager();
  const cadRoot = generateV8SectorTree(depth, children);
  const cadMetadata = createCadModelMetadata(8, cadRoot);
  materialManager.addModelMaterials(cadMetadata.modelIdentifier, cadMetadata.scene.maxTreeIndex);

  const mockV8SectorRepository = new Mock<V8SectorRepository>();

  const cadNode = new CadNode(cadMetadata, materialManager, mockV8SectorRepository.object());
  const apiClient = new NodesLocalClient();
  const model = new Cognite3DModel(modelId, revisionId, cadNode, apiClient);

  return model;
}
