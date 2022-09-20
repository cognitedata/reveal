/*!
 * Copyright 2021 Cognite AS
 */
import { CadNode, Cognite3DModel } from '../../packages/cad-model';
import { NodesLocalClient } from '../../packages/nodes-api';
import { CadMaterialManager } from '../../packages/rendering';

import { createCadModelMetadata } from './createCadModelMetadata';

import { Mock } from 'moq.ts';
import { SectorRepository } from '@reveal/sector-loader';
import { generateV9SectorTree } from './createSectorMetadata';

export function createCadModel(
  modelId: number,
  revisionId: number,
  depth: number = 3,
  children: number = 3
): Cognite3DModel {
  const materialManager = new CadMaterialManager();
  const cadRoot = generateV9SectorTree(depth, children);
  const cadMetadata = createCadModelMetadata(9, cadRoot);
  materialManager.addModelMaterials(cadMetadata.modelIdentifier, cadMetadata.scene.maxTreeIndex);

  const mockV8SectorRepository = new Mock<SectorRepository>();

  const cadNode = new CadNode(cadMetadata, materialManager, mockV8SectorRepository.object());
  const apiClient = new NodesLocalClient();
  const model = new Cognite3DModel(modelId, revisionId, cadNode, apiClient);

  return model;
}
