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

export type SceneSectorMetadata = BaseSceneSectorMetadata & (GltfSceneSectorMetadata | I3dF3dSceneSectorMetadata);
export type V8SceneSectorMetadata = BaseSceneSectorMetadata & I3dF3dSceneSectorMetadata;
export type V9SceneSectorMetadata = BaseSceneSectorMetadata & GltfSceneSectorMetadata;

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

export type I3dF3dSceneSectorMetadata = {
  readonly indexFile: {
    readonly fileName: string;
    readonly peripheralFiles: string[];
    readonly downloadSize: number;
  };
  readonly facesFile: {
    readonly quadSize: number;
    readonly coverageFactors: {
      xy: number;
      yz: number;
      xz: number;
    };
    readonly recursiveCoverageFactors:
      | {
          xy: number;
          yz: number;
          xz: number;
        }
      | undefined;
    readonly fileName: string | null;
    readonly downloadSize: number;
  } | null;
};
