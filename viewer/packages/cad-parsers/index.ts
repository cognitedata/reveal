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

export {
  filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix,
  filterPrimitivesOutsideClipBoxByCenterAndRadius,
  filterPrimitivesOutsideClipBoxByEllipse,
  filterPrimitivesOutsideClipBoxByVertices
} from './src/cad/filterPrimitivesV8';

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
  // torusGeometryBoundingBox, // disabled due to error in torus bounding box
  nutGeometryBoundingBox
} from './src/cad/primitiveGeometries';

export {
  SectorGeometry,
  InstancedMeshFile,
  InstancedMesh,
  TriangleMesh,
  WantedSector,
  ConsumedSector
} from './src/cad/types';

export { getDistanceToMeterConversionFactor } from './src/utilities/types';

export { createTriangleMeshes } from './src/cad/triangleMeshes';
