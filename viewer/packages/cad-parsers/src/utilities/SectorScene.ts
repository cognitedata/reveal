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

  private detectIntersectingBounds(bounds: THREE.Box3, clusters: THREE.Box3[]): THREE.Box3[] {
    const intersectingClusters: THREE.Box3[] = [];
    const potentialJunkClusters: THREE.Box3[] = [];

    clusters.forEach(cluster => {
      if (bounds !== cluster) {
        if (bounds.intersectsBox(cluster)) {
          intersectingClusters.push(cluster);
        } else {
          potentialJunkClusters.push(cluster);
        }
      }
    });

    let outClusters = intersectingClusters;
    if (potentialJunkClusters.length > 0) {
      intersectingClusters.forEach(cluster => {
        outClusters = outClusters.concat(this.detectIntersectingBounds(cluster, potentialJunkClusters));
      });
    }
    return outClusters;
  }

  private computeBoundsOfMostGeometry(): THREE.Box3 {
    if (this.root.children.length === 0) {
      return this.root.subtreeBoundingBox;
    }

    // Find all leaf bounds and count overall render cost
    const allBounds: THREE.Box3[] = [];
    {
      let allBoundsRenderCost = 0;
      traverseDepthFirst(this.root, x => {
        if (x.children.length === 0) {
          allBoundsRenderCost += x.estimatedRenderCost;
          allBounds.push(x.subtreeBoundingBox);
        }
        return true;
      });

      // If more than 5% of the geometry is located in the root we return the full BoundingBox.
      const rootGeomeryThreshold = allBoundsRenderCost * 0.05;
      if (this.root.estimatedRenderCost > rootGeomeryThreshold) {
        return this.root.subtreeBoundingBox;
      }
    }

    // Sort by diagonal length, ascending
    allBounds.sort((a, b) => {
      return a.min.distanceTo(a.max) - b.min.distanceTo(b.max);
    });

    //Discard 1% of largest bounds
    const validBounds = allBounds.slice(0, Math.ceil(allBounds.length * 0.99));

    // Find valid corners and create a merged bonds consisting of all valid bounds
    const corners: number[][] = [];
    {
      const validBoundsMerged = new THREE.Box3();
      validBounds.forEach(x => {
        corners.push(x.min.toArray(), x.max.toArray());
        validBoundsMerged.union(x);
      });

      // Create a centroid for each "corner" of the validBounds + one for the center.
      // This is mostly done because skmeans would return different clusters when it
      // was allowed to pick centroids itself.
      const { min, max } = validBoundsMerged;
      const centerZ = min.z + (max.z - min.z) * 0.5;
      const centroids: number[][] = [
        [min.x, min.y, centerZ],
        [min.x, max.y, centerZ],
        [max.x, min.y, centerZ],
        [max.x, max.y, centerZ],
        [min.x + (max.x - min.x) * 0.5, min.y + (max.y - min.y) * 0.5, centerZ]
      ];

      // Cluster the corners into groups and determine bounds of each cluster
      const numClusters = Math.min(corners.length, centroids.length);
      const clusters = skmeans(corners, numClusters, centroids, 10);
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

      // Get all validBounds that belongs to a cluster and merge them into one.
      clusters.idxs.forEach((cluster, idx) => {
        clusterBounds[cluster].union(validBounds[Math.floor(idx / 2)]);
      });

      // Find chains of intersecting bounds starting with the biggestCluster
      const intersections = this.detectIntersectingBounds(clusterBounds[biggestCluster], clusterBounds);

      // Merge bounds into final bounding box.
      const mergedBounds = clusterBounds[biggestCluster].clone();
      intersections.forEach(cluster => {
        mergedBounds.union(cluster);
      });
      return mergedBounds;
    }
  }
}
