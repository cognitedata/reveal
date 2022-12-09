/*!
 * Copyright 2021 Cognite AS
 */
export type CadSceneRootMetadata = {
  readonly version: number;
  readonly maxTreeIndex: number;
  readonly sectors: SceneSectorMetadata[];
  readonly unit: string | null;

  // Available, but unused:
  // readonly projectId: number;
  // readonly modelId: number;
  // readonly revisionId: number;
  // readonly subRevisionId: number;
};

export type SceneSectorMetadata = BaseSceneSectorMetadata & GltfSceneSectorMetadata;

export type BoundingBox = {
  readonly min: {
    x: number;
    y: number;
    z: number;
  };
  readonly max: {
    x: number;
    y: number;
    z: number;
  };
};

export type BaseSceneSectorMetadata = {
  readonly id: number;
  readonly parentId: number | null;
  readonly path: string;
  readonly depth: number;
  readonly estimatedDrawCallCount: number;
  readonly estimatedTriangleCount: number;

  readonly boundingBox: BoundingBox;
  readonly geometryBoundingBox?: BoundingBox;
};

export type GltfSceneSectorMetadata = {
  readonly sectorFileName: string | null;
  readonly maxDiagonalLength: number;
  readonly minDiagonalLength: number;
  readonly downloadSize: number;
};
