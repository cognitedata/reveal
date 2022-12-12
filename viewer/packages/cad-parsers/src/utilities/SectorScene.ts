/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { traverseDepthFirst } from '@reveal/utilities';
import { SectorScene } from './types';
import { SectorMetadata } from '../metadata/types';
import skmeans from 'skmeans';

export class SectorSceneImpl implements SectorScene {
  readonly version: number;
  readonly maxTreeIndex: number;
  readonly root: SectorMetadata;
  readonly unit: string;
  private readonly sectors: Map<number, SectorMetadata>;
  private _cachedBoundsOfMostGeometry: THREE.Box3 | undefined;

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
      if (x.subtreeBoundingBox.containsPoint(p)) {
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
      if (x.subtreeBoundingBox.intersectsBox(b)) {
        accepted.push(x);
        return true;
      }
      return false;
    });
    return accepted;
  }

  getBoundsOfMostGeometry(): THREE.Box3 {
    this._cachedBoundsOfMostGeometry = this._cachedBoundsOfMostGeometry ?? this.computeBoundsOfMostGeometry();
    return this._cachedBoundsOfMostGeometry;
  }

  getSectorsIntersectingFrustum(
    projectionMatrix: THREE.Matrix4,
    inverseCameraModelMatrix: THREE.Matrix4
  ): SectorMetadata[] {
    const frustumMatrix = new THREE.Matrix4().multiplyMatrices(projectionMatrix, inverseCameraModelMatrix);
    const frustum = new THREE.Frustum().setFromProjectionMatrix(frustumMatrix);
    const accepted: SectorMetadata[] = [];
    traverseDepthFirst(this.root, x => {
      if (frustum.intersectsBox(x.subtreeBoundingBox)) {
        accepted.push(x);
        return true;
      }
      return false;
    });
    return accepted;
  }

  private mergeBounds(outBounds: THREE.Box3, expandBy: THREE.Box3) {
    outBounds.expandByPoint(expandBy.min);
    outBounds.expandByPoint(expandBy.max);
  }

  private computeBoundsOfMostGeometry(): THREE.Box3 {
    if (this.root.children.length === 0) {
      return this.root.subtreeBoundingBox;
    }

    // Find all leaf bounds
    const allBounds: THREE.Box3[] = [];
    traverseDepthFirst(this.root, x => {
      if (x.children.length === 0) {
        allBounds.push(x.subtreeBoundingBox);
      }
      return true;
    });

    //Sort by diagonal length, ascending
    allBounds.sort((a, b) => {
      return a.min.distanceTo(a.max) - b.min.distanceTo(b.max);
    });

    //Discard 1% of largest bounds
    const validBounds = allBounds.slice(0, Math.ceil(allBounds.length * 0.99));

    //Find valid corners
    const corners: number[][] = [];
    validBounds.forEach(x => {
      corners.push(x.min.toArray(), x.max.toArray());
    });

    // Cluster the corners into four (or less) groups and determine bounds of each cluster
    const numClusters = Math.min(corners.length, 4);
    const clusters = skmeans(corners, numClusters, 'kmpp', 10);
    const clusterCounts = new Array<number>(numClusters).fill(0);
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

    //Calcualate bounds for each cluster
    clusters.idxs.forEach((cluster, idx) => {
      clusterCounts[cluster]++;
      this.mergeBounds(clusterBounds[cluster], validBounds[Math.floor(idx / 2)]);
    });

    // Start looking for intersections and merge overlapping bounds into final bounding box.
    // Bounds that do not intersect are kept as potentialJunk, but are retried if the merged bounds grow.
    // At the end, assume any non-overlapping clusters are junk.
    const mergedBounds = clusterBounds[biggestCluster].clone();
    const potentialJunk: THREE.Box3[] = [];
    clusterBounds.forEach(cluster => {
      if (cluster.intersectsBox(mergedBounds)) {
        this.mergeBounds(mergedBounds, cluster);

        potentialJunk.forEach((junk, index) => {
          if (junk.intersectsBox(mergedBounds)) {
            this.mergeBounds(mergedBounds, junk);
            potentialJunk.splice(index, 1);
          }
        });
      } else {
        potentialJunk.push(cluster);
      }
    });
    return mergedBounds;
  }
}
