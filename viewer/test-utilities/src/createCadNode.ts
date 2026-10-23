/*!
 * Copyright 2025 Cognite AS
 */
import { CadNode } from '../../packages/cad-model';
import type { SectorRepository } from '../../packages/sector-loader';
import { Mock } from 'moq.ts';
import { createCadModelMetadata } from './createCadModelMetadata';
import type { File3dFormat } from '../../packages/data-providers';
import { generateV9SectorTree } from './createSectorMetadata';
import { CadMaterialManager } from '../../packages/rendering';
import { PickCacheInvalidator } from '../../packages/utilities';

export function createCadNode(
  depth: number = 3,
  children: number = 3,
  overrides?: {
    sectorRepository?: SectorRepository;
    format?: File3dFormat;
    pickCacheInvalidator?: PickCacheInvalidator;
  },
  maxTreeIndex: number = 1
): CadNode {
  const pickCacheInvalidator = overrides?.pickCacheInvalidator ?? new PickCacheInvalidator();
  const materialManager = new CadMaterialManager(pickCacheInvalidator);
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

  const cadNode = new CadNode(cadMetadata, mockSectorRepository, pickCacheInvalidator);
  materialManager.addModelMaterials(cadMetadata.modelIdentifier.revealInternalId, cadNode.cadMaterial);

  return cadNode;
}
