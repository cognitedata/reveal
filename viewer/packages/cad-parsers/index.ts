/*!
 * Copyright 2021 Cognite AS
 */

export { CadMetadataParser } from './src/metadata/CadMetadataParser';
export { MetadataRepository } from './src/metadata/MetadataRepository';
export { CadModelMetadataRepository } from './src/metadata/CadModelMetadataRepository';
export { CadModelMetadata } from './src/metadata/CadModelMetadata';
export { SectorScene, BinaryFileProvider, ModelDataClient } from './src/utilities/types';

export { SectorSceneImpl } from './src/utilities/SectorScene';
export { SectorSceneFactory } from './src/utilities/SectorSceneFactory';

export { SectorMetadata, V8SectorMetadata, V9SectorMetadata } from './src/metadata/types';

export { SectorNode } from './src/sector/SectorNode';
export { RootSectorNode } from './src/sector/RootSectorNode';

export { CadSectorParser } from './src/cad/CadSectorParser';

export { LevelOfDetail } from './src/cad/LevelOfDetail';

export {
  filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix,
  filterPrimitivesOutsideClipBoxByCenterAndRadius,
  filterPrimitivesOutsideClipBoxByEllipse,
  filterPrimitivesOutsideClipBoxByVertices
} from './src/cad/filterPrimitives';

export { filterInstanceMesh } from './src/cad/filterInstanceMesh';

export {
  boxGeometry,
  quadGeometry,
  coneGeometry,
  trapeziumGeometry,
  nutGeometry,
  torusLodGeometries,
  boxGeometryBoundingBox,
  quadGeometryBoundingBox,
  torusGeometryBoundingBox,
  nutGeometryBoundingBox
} from './src/cad/primitiveGeometries';

export { InstancedMeshFile, InstancedMesh, TriangleMesh } from './src/cad/types';

export { SectorGeometry, WantedSector, ConsumedSector } from './src/utilities/types';

export { WellKnownDistanceToMeterConversionFactors } from './src/utilities/types';

export { createTriangleMeshes } from './src/cad/triangleMeshes';
