/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DModel } from '../../core/src/public/migration/Cognite3DModel';
import { NodesLocalClient } from '../../packages/nodes-api';
import { CadMaterialManager, CadNode } from '../../packages/rendering';
import { V8SectorRepository } from '../../packages/sector-loader';
import { BinaryFileProvider } from '../../packages/modeldata-api';

import { createCadModelMetadata } from './createCadModelMetadata';
import { generateV8SectorTree } from './createSectorMetadata';

import { Mock } from 'moq.ts';

export function createV8CadModel(modelId: number, revisionId: number, depth: number = 3, children: number = 3 ): Cognite3DModel {

  const cadNode = createV8CadNode(depth, children);

  const apiClient = new NodesLocalClient();
  const model = new Cognite3DModel(modelId, revisionId, cadNode, apiClient);

  return model;
}

export function createV8CadNode(depth: number = 3, children: number = 3): CadNode {
  const materialManager = new CadMaterialManager();
  const cadRoot = generateV8SectorTree(depth, children);

  const cadMetadata = createCadModelMetadata(8, cadRoot);
  materialManager.addModelMaterials(cadMetadata.modelIdentifier, cadMetadata.scene.maxTreeIndex);

  const mockBinaryFileProvider = new Mock<BinaryFileProvider>();
  const sectorRepository = new V8SectorRepository(mockBinaryFileProvider.object(), materialManager);

  return new CadNode(cadMetadata, materialManager, sectorRepository);
}
