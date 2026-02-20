/*!
 * Copyright 2021 Cognite AS
 */
export type CadSceneRootMetadata = {
  readonly version: number;
  readonly maxTreeIndex: number;
  readonly sectors: SceneSectorMetadata[];
  readonly unit: string | null;
  readonly signedUrl?: string;

  // Available, but unused:
  // readonly projectId: number;
  // readonly modelId: number;
  // readonly revisionId: number;
  // readonly subRevisionId: number;
};

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

export type SceneSectorMetadata = {
  readonly id: number;
  readonly parentId: number | null;
  readonly path: string;
  readonly depth: number;
  readonly estimatedDrawCallCount: number;
  readonly estimatedTriangleCount: number;

  readonly boundingBox: BoundingBox;
  readonly geometryBoundingBox?: BoundingBox;

  readonly sectorFileName: string | null;
  readonly texturedFileName: string | null; // See sector-parser README
  readonly maxDiagonalLength: number;
  readonly minDiagonalLength: number;
  readonly downloadSize: number;
  readonly signedUrl?: string;
};
