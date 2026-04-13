/*!
 * Copyright 2025 Cognite AS
 */
import { CadNode } from '../../packages/cad-model';
import { SectorRepository } from '../../packages/sector-loader';
import { Mock } from 'moq.ts';
import { createCadModelMetadata } from './createCadModelMetadata';
import { File3dFormat } from '../../packages/data-providers';
import { generateV9SectorTree } from './createSectorMetadata';
import { CadMaterialManager } from '../../packages/rendering';

export function createCadNode(
  depth: number = 3,
  children: number = 3,
  overrides?: { sectorRepository?: SectorRepository; format?: File3dFormat },
  maxTreeIndex: number = 1
): CadNode {
  const materialManager = new CadMaterialManager();
  const cadRoot = generateV9SectorTree(depth, children);
  const cadMetadata = {
    ...createCadModelMetadata(9, cadRoot, maxTreeIndex),
    ...(overrides?.format !== undefined ? { format: overrides.format } : {})
  };

  const mockSectorRepository =
    overrides?.sectorRepository ??
    new Mock<SectorRepository>()
      .setup(p => p.clearCache)
      .returns(() => {})
      .setup(p => p.dereferenceSector)
      .returns(() => {})
      .object();

  const cadNode = new CadNode(cadMetadata, materialManager, mockSectorRepository);
  materialManager.addModelMaterials(cadMetadata.modelIdentifier.revealInternalId, cadNode.cadMaterial);

  return cadNode;
}
