/*!
 * Copyright 2021 Cognite AS
 */

export { CadMetadataParser } from './src/metadata/CadMetadataParser';
export { CadModelMetadataRepository } from './src/metadata/CadModelMetadataRepository';
export { CadModelMetadata } from './src/metadata/CadModelMetadata';
export { SectorSceneImpl } from './src/utilities/SectorScene';
export { SectorSceneFactory } from './src/utilities/SectorSceneFactory';
export { CadModelClipper } from './src/metadata/CadModelClipper';

export { SectorScene } from './src/utilities/types';

export { SectorMetadata, V8SectorMetadata, V9SectorMetadata } from './src/metadata/types';

export { SectorNode } from './src/sector/SectorNode';
export { RootSectorNode } from './src/sector/RootSectorNode';

export { CadSectorParser } from './src/cad/CadSectorParser';

export { LevelOfDetail } from './src/cad/LevelOfDetail';

export { filterInstanceMesh } from './src/cad/filterInstanceMesh';

export {
  SectorGeometry,
  InstancedMeshFile,
  InstancedMesh,
  TriangleMesh,
  WantedSector,
  ConsumedSector
} from './src/cad/types';

export { createSimpleGeometryMesh } from './src/cad/createSimpleGeometryMesh';
export { createPrimitives } from './src/cad/primitives';

export { getDistanceToMeterConversionFactor } from './src/utilities/types';

export { createTriangleMeshes } from './src/cad/triangleMeshes';
