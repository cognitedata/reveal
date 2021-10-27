/*!
 * Copyright 2021 Cognite AS
 */
export type CadSceneMetadata = {
  readonly version: number;
  readonly maxTreeIndex: number;
  readonly sectors: CadSectorMetadata[];
  readonly unit: string | null;

  // Available, but unused:
  // readonly projectId: number;
  // readonly modelId: number;
  // readonly revisionId: number;
  // readonly subRevisionId: number;
};

export type CadSectorMetadata = BaseCadSectorMetadata & (GltfCadSectorMetadata | V8CadSectorMetadata);

export type BaseCadSectorMetadata = {
  readonly id: number;
  readonly parentId: number | null;
  readonly path: string;
  readonly depth: number;
  readonly estimatedDrawCallCount: number;
  readonly estimatedTriangleCount: number;

  readonly boundingBox: {
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
};

export type GltfCadSectorMetadata = {
  readonly sectorFileName: string | null;
  readonly maxDiagonalLength: number;
  readonly downloadSize: number;
};

export type V8CadSectorMetadata = {
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
