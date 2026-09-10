/*!
 * Copyright 2021 Cognite AS
 */

export { CadModelMetadataRepository } from './src/metadata/CadModelMetadataRepository';
export type { CadModelMetadata } from './src/metadata/CadModelMetadata';
export { SectorSceneFactory } from './src/utilities/SectorSceneFactory';
export { CadModelClipper } from './src/metadata/CadModelClipper';

export type { SectorScene } from './src/utilities/types';

export type { SectorMetadata } from './src/metadata/types';

export { SectorNode } from './src/sector/SectorNode';
export { RootSectorNode } from './src/sector/RootSectorNode';

export { LevelOfDetail } from './src/cad/LevelOfDetail';

export { filterGeometryOutsideClipBox } from './src/cad/filterPrimitivesV9';

export type {
  InstancedMeshFile,
  InstancedMesh,
  TriangleMesh,
  WantedSector,
  ConsumedSector,
  ParsedMeshGeometry
} from './src/cad/types';

export { getDistanceToMeterConversionFactor } from './src/utilities/types';
