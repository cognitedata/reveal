import { CadNode } from '../../packages/cad-model';
import { SectorRepository } from '../../packages/sector-loader';
import { Mock } from 'moq.ts';
import { createCadModelMetadata } from './createCadModelMetadata';
import { generateV9SectorTree } from './createSectorMetadata';
import { CadMaterialManager } from '../../packages/rendering';

export function createCadNode(
  depth: number = 3,
  children: number = 3,
  overrides?: { sectorRepository?: SectorRepository }
) {
  const materialManager = new CadMaterialManager();
  const cadRoot = generateV9SectorTree(depth, children);
  const cadMetadata = createCadModelMetadata(9, cadRoot);
  materialManager.addModelMaterials(cadMetadata.modelIdentifier, cadMetadata.scene.maxTreeIndex);

  const mockSectorRepository =
    overrides?.sectorRepository ??
    new Mock<SectorRepository>()
      .setup(p => p.clearCache)
      .returns(() => {})
      .object();

  return new CadNode(cadMetadata, materialManager, mockSectorRepository);
}
