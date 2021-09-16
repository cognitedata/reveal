/*!
 * Copyright 2021 Cognite AS
 */

export { CadMetadataParser } from './src/metadata/CadMetadataParser';
export { MetadataRepository } from './src/metadata/MetadataRepository';
export { CadModelMetadataRepository } from './src/metadata/CadModelMetadataRepository';
export { CadModelMetadata } from './src/metadata/CadModelMetadata';
export { SectorSceneImpl } from './src/utilities/SectorScene';
export { SectorSceneFactory } from './src/utilities/SectorSceneFactory';

export {
  SectorScene,
  BinaryFileProvider,
  ModelDataClient,
  BlobOutputMetadata
} from './src/utilities/types';

export {
  SectorMetadataIndexFileSection,
  SectorMetadataFacesFileSection,
  SectorMetadata,
} from './src/metadata/types';

export { CadSectorParser } from './src/cad/CadSectorParser';

export { File3dFormat } from './src/utilities/types';

export { RenderMode } from './src/cad/RenderMode';

export { LevelOfDetail } from './src/cad/LevelOfDetail';

export { SectorGeometry, InstancedMeshFile, InstancedMesh, TriangleMesh, WantedSector, ConsumedSector } from './src/cad/types';

export { createMaterials, Materials } from './src/cad/materials';
export { createPrimitives } from './src/cad/primitives';
export { filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix } from './src/cad/filterPrimitives';

export { outlineDetectionShaders, fxaaShaders, ssaoShaders, ssaoBlurCombineShaders, coverageShaders } from './src/cad/shaders';
