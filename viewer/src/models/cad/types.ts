/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { Box3 } from '../../utils/Box3';
import { mat4, vec3 } from 'gl-matrix';
import { PrimitiveAttributes } from '../../workers/types/parser.types';
import { traverseDepthFirst } from '../../utils/traversal';
import { toThreeMatrix4, toThreeJsBox3 } from '../../views/threejs/utilities';

// TODO 2019-11-12 larsmoa: Move and rename to something general (not specific
// for sector data).
export type SectorModelTransformation = {
  readonly modelMatrix: mat4;
  readonly inverseModelMatrix: mat4;
};

export interface SectorMetadata {
  readonly id: number;
  readonly path: string;
  readonly depth: number;
  readonly bounds: Box3;
  readonly indexFile: {
    readonly fileName: string;
    readonly peripheralFiles: string[];
    readonly estimatedDrawCallCount: number;
    readonly downloadSize: number;
  };
  readonly facesFile: {
    readonly quadSize: number;
    /**
     * Coverage factors for the sector without children.
     */
    readonly coverageFactors: {
      xy: number;
      yz: number;
      xz: number;
    };
    /**
     * Coverage factor for the sectors including children.
     */
    readonly recursiveCoverageFactors: {
      xy: number;
      yz: number;
      xz: number;
    };
    readonly fileName: string | null;
    readonly downloadSize: number;
  };
  readonly children: SectorMetadata[];

  // TODO 2019-12-21 larsmoa: Make readonly
  parent?: SectorMetadata;
}

export interface SectorScene {
  readonly version: number;
  readonly maxTreeIndex: number;
  readonly root: SectorMetadata;

  getSectorById(sectorId: number): SectorMetadata | undefined;
  getSectorsContainingPoint(p: vec3): SectorMetadata[];
  getSectorsIntersectingBox(b: Box3): SectorMetadata[];
  getSectorsIntersectingFrustum(projectionMatrix: mat4, inverseCameraModelMatrix: mat4): SectorMetadata[];
  getAllSectors(): SectorMetadata[];

  // Available, but not supported:
  // readonly projectId: number;
  // readonly modelId: number;
  // readonly revisionId: number;
  // readonly subRevisionId: number;
  // readonly unit: string | null;
}

export class SectorSceneImpl implements SectorScene {
  readonly version: number;
  readonly maxTreeIndex: number;
  readonly root: SectorMetadata;
  private readonly sectors: Map<number, SectorMetadata>;

  constructor(version: number, maxTreeIndex: number, root: SectorMetadata, sectorsById: Map<number, SectorMetadata>) {
    this.version = version;
    this.maxTreeIndex = maxTreeIndex;
    this.root = root;
    this.sectors = sectorsById;
  }

  getSectorById(sectorId: number): SectorMetadata | undefined {
    return this.sectors.get(sectorId);
  }

  getAllSectors(): SectorMetadata[] {
    return [...this.sectors.values()];
  }

  getSectorsContainingPoint(p: vec3): SectorMetadata[] {
    const accepted: SectorMetadata[] = [];
    traverseDepthFirst(this.root, x => {
      if (x.bounds.containsPoint(p)) {
        accepted.push(x);
        return true;
      }
      return false;
    });
    return accepted;
  }

  getSectorsIntersectingBox(b: Box3): SectorMetadata[] {
    const accepted: SectorMetadata[] = [];
    traverseDepthFirst(this.root, x => {
      if (x.bounds.intersectsBox(b)) {
        accepted.push(x);
        return true;
      }
      return false;
    });
    return accepted;
  }

  getSectorsIntersectingFrustum(projectionMatrix: mat4, inverseCameraModelMatrix: mat4): SectorMetadata[] {
    const frustumMatrix = mat4.multiply(mat4.create(), projectionMatrix, inverseCameraModelMatrix);
    const frustum = new THREE.Frustum().setFromProjectionMatrix(toThreeMatrix4(frustumMatrix));
    const bbox = new THREE.Box3();

    const accepted: SectorMetadata[] = [];
    traverseDepthFirst(this.root, x => {
      if (frustum.intersectsBox(toThreeJsBox3(bbox, x.bounds))) {
        accepted.push(x);
        return true;
      }
      return false;
    });
    return accepted;
  }
}

export type Color = number;

export type TriangleMesh = {
  readonly fileId: number;
  readonly indices: Uint32Array;
  readonly treeIndices: Float32Array;
  readonly vertices: Float32Array;
  readonly normals: Float32Array | undefined;
  readonly colors: Float32Array;
};

export type InstancedMeshFile = {
  readonly fileId: number;
  readonly indices: Uint32Array;
  readonly vertices: Float32Array;
  readonly normals: Float32Array | undefined;
  readonly instances: InstancedMesh[];
};

export type InstancedMesh = {
  readonly triangleCount: number;
  readonly triangleOffset: number;
  readonly colors: Uint8Array;
  readonly instanceMatrices: Float32Array;
  readonly treeIndices: Float32Array;
};

// TODO 2019-12-05 larsmoa: Rename to e.g. SectorGeometry to avoid
// confusion with other Sector-class
export interface Sector {
  readonly nodeIdToTreeIndexMap: Map<number, number>;
  readonly treeIndexToNodeIdMap: Map<number, number>;

  readonly instanceMeshes: InstancedMeshFile[];
  readonly triangleMeshes: TriangleMesh[];

  readonly boxes: PrimitiveAttributes;
  readonly circles: PrimitiveAttributes;
  readonly cones: PrimitiveAttributes;
  readonly eccentricCones: PrimitiveAttributes;
  readonly ellipsoidSegments: PrimitiveAttributes;
  readonly generalCylinders: PrimitiveAttributes;
  readonly generalRings: PrimitiveAttributes;
  readonly nuts: PrimitiveAttributes;
  readonly quads: PrimitiveAttributes;
  readonly sphericalSegments: PrimitiveAttributes;
  readonly torusSegments: PrimitiveAttributes;
  readonly trapeziums: PrimitiveAttributes;
}

export interface SectorQuads {
  readonly nodeIdToTreeIndexMap: Map<number, number>;
  readonly treeIndexToNodeIdMap: Map<number, number>;
  readonly buffer: Float32Array;
}

export enum LoadSectorStatus {
  Awaiting,
  InFlight,
  Cancelled,
  Resolved
}

export type LoadSectorRequest = {
  readonly promise: Promise<void>;
  cancel: () => void;
  status: () => LoadSectorStatus;
};

// TODO move somewhere else?
export interface CtmWorkerResult {
  readonly indices: Uint32Array;
  readonly vertices: Float32Array;
  readonly normals: Float32Array | undefined;
}
