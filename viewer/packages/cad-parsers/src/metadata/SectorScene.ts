/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { traverseDepthFirst } from './objectTraversal';
import { SectorMetadata, SectorScene } from './types';
import skmeans from 'skmeans';

export class SectorSceneImpl implements SectorScene {
  static createFromRootSector(version: number, maxTreeIndex: number, unit: string, root: SectorMetadata): SectorScene {
    const sectorsById: Map<number, SectorMetadata> = new Map();
    traverseDepthFirst(root, x => {
      sectorsById.set(x.id, x);
      return true;
    });
    return new SectorSceneImpl(version, maxTreeIndex, unit, root, sectorsById);
  }

  readonly version: number;
  readonly maxTreeIndex: number;
  readonly root: SectorMetadata;
  readonly unit: string;
  private readonly sectors: Map<number, SectorMetadata>;

  constructor(
    version: number,
    maxTreeIndex: number,
    unit: string,
    root: SectorMetadata,
    sectorsById: Map<number, SectorMetadata>
  ) {
    this.version = version;
    this.maxTreeIndex = maxTreeIndex;
    this.root = root;
    this.sectors = sectorsById;
    this.unit = unit;
  }

  get sectorCount(): number {
    return this.sectors.size;
  }

  getSectorById(sectorId: number): SectorMetadata | undefined {
    return this.sectors.get(sectorId);
  }

  getAllSectors(): SectorMetadata[] {
    return [...this.sectors.values()];
  }

  getSectorsContainingPoint(p: THREE.Vector3): SectorMetadata[] {
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

  getSectorsIntersectingBox(b: THREE.Box3): SectorMetadata[] {
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

  getBoundsOfMostGeometry(): THREE.Box3 {
    if (this.root.children.length === 0) {
      return this.root.bounds;
    }

    // Determine all corners of the bboxes
    const allBounds: THREE.Box3[] = [];
    const corners: number[][] = [];
    traverseDepthFirst(this.root, x => {
      if (x.children.length === 0) {
        corners.push(x.bounds.min.toArray(), x.bounds.max.toArray());
        allBounds.push(x.bounds, x.bounds);
      }
      return true;
    });
    // Cluster the corners into four groups and determine bounds of each cluster
    const numClusters = Math.min(corners.length, 4);
    const clusters = skmeans(corners, numClusters, 'kmpp', 10);
    const clusterCounts = new Array<number>(clusters.idxs.length).fill(0);
    const clusterBounds = clusterCounts.map(_ => new THREE.Box3());
    clusters.idxs.map(x => clusterCounts[x]++);
    const biggestCluster = clusterCounts.reduce(
      (max, count, idx) => {
        if (count > max.count) {
          max.count = count;
          max.idx = idx;
        }
        return max;
      },
      { count: 0, idx: -1 }
    ).idx;
    clusters.idxs.forEach((cluster, idx) => {
      clusterCounts[cluster]++;
      clusterBounds[cluster].expandByPoint(allBounds[idx].min);
      clusterBounds[cluster].expandByPoint(allBounds[idx].max);
    });

    const intersectingBounds = clusterBounds.filter((x, idx) => {
      if (idx !== biggestCluster && x.intersectsBox(clusterBounds[biggestCluster])) {
        return true;
      }
      return false;
    });
    if (intersectingBounds.length > 0) {
      // Overlapping clusters - assume it's because the model doesn't contain junk geometry
      const merged = clusterBounds[biggestCluster].clone();
      intersectingBounds.forEach(x => {
        merged.expandByPoint(x.min);
        merged.expandByPoint(x.max);
      });
      return merged;
    } else {
      // Create bounds of the biggest cluster - assume the smallest one is junk geometry
      return clusterBounds[biggestCluster];
    }
  }

  getSectorsIntersectingFrustum(
    projectionMatrix: THREE.Matrix4,
    inverseCameraModelMatrix: THREE.Matrix4
  ): SectorMetadata[] {
    const frustumMatrix = new THREE.Matrix4().multiplyMatrices(projectionMatrix, inverseCameraModelMatrix);
    const frustum = new THREE.Frustum().setFromProjectionMatrix(frustumMatrix);
    const accepted: SectorMetadata[] = [];
    traverseDepthFirst(this.root, x => {
      if (frustum.intersectsBox(x.bounds)) {
        accepted.push(x);
        return true;
      }
      return false;
    });
    return accepted;
  }
}
