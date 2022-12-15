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

  /**
   * Recursive intersection detection.
   */
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

  /**
   * Use kmeans to group inputBounds into clusters.
   *
   * @param inBounds The bounds to be grouped into clusters.
   * @returns Both the list of cluster bounds and the cluster with the highest node count
   */
  private generateClusters(inBounds: THREE.Box3[]): [THREE.Box3[], THREE.Box3] {
    // Store the position of the min and max corners of each bound in 'nodes'
    // Also generate a merged box of all bounds that is used to calculate centroid positions later
    const nodes: number[][] = [];
    const mergedBounds = new THREE.Box3();
    inBounds.forEach(x => {
      nodes.push(x.min.toArray(), x.max.toArray());
      mergedBounds.union(x);
    });

    // Create a centroid for each "corner" of the mergedBounds + one for the center.
    // This is mostly done because skmeans would return different clusters when it
    // was allowed to pick centroids itself.
    const { min, max } = mergedBounds;
    const centerZ = min.z + (max.z - min.z) * 0.5;
    const centroids: number[][] = [
      [min.x, min.y, centerZ],
      [min.x, max.y, centerZ],
      [max.x, min.y, centerZ],
      [max.x, max.y, centerZ],
      [min.x + (max.x - min.x) * 0.5, min.y + (max.y - min.y) * 0.5, centerZ]
    ];

    // Use skmeans to group the corners into clusters
    const numClusters = Math.min(nodes.length, centroids.length);
    const result = skmeans(nodes, numClusters, centroids, 10);

    // Count number of nodes in each cluster
    const clusterCounts = new Array<number>(numClusters).fill(0);
    result.idxs.map(x => clusterCounts[x]++);
    const biggestClusterIndex = clusterCounts.reduce((max, count, idx) => (count > max.count ? { count, idx } : max), {
      count: 0,
      idx: -1
    }).idx;

    // For each cluster, create the combined bounds of all nodes that belong to it
    const clusterBounds = clusterCounts.map(_ => new THREE.Box3());
    result.idxs.forEach((cluster, idx) => {
      clusterBounds[cluster].union(inBounds[Math.floor(idx / 2)]);
    });

    return [clusterBounds, clusterBounds[biggestClusterIndex]];
  }

  private computeBoundsOfMostGeometry(): THREE.Box3 {
    if (this.root.children.length === 0) {
      return this.root.subtreeBoundingBox;
    }

    const allBounds: THREE.Box3[] = [];
    {
      // Find all leaf bounds and count overall render cost
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

    // Sort by diagonal length (ascending) and discard 1% of largest bounds
    allBounds.sort((a, b) => {
      return a.min.distanceTo(a.max) - b.min.distanceTo(b.max);
    });
    const validBounds = allBounds.slice(0, Math.ceil(allBounds.length * 0.99));

    // Generate clusters from the valid bounds.
    const [clusterBounds, biggestCluster] = this.generateClusters(validBounds);

    // Find chains of intersecting bounds starting with the biggestCluster
    const intersections = this.detectIntersectingBounds(biggestCluster, clusterBounds);

    // Merge bounds into final bounding box.
    const finalBounds = biggestCluster.clone();
    intersections.forEach(cluster => {
      finalBounds.union(cluster);
    });
    return finalBounds;
  }
}
