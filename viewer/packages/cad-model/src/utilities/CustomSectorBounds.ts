/*!
 * Copyright 2022 Cognite AS
 */

import { SectorNode } from '@reveal/cad-parsers';
import { CadNode } from '../wrappers/CadNode';

interface TransformedNode {
  currentTransform: THREE.Matrix4;
  originalBoundingBoxInSectors: Map<number, THREE.Box3>;
}

export class CustomSectorBounds {
  private readonly treeIndexToTransformedNodeMap = new Map<number, TransformedNode>();
  private readonly sectorIdToTransformedNodesMap = new Map<number, Set<TransformedNode>>();
  private readonly originalSectorBounds = new Map<number, THREE.Box3>();
  private readonly sectorsWithInvalidBounds = new Set<number>();

  constructor(private readonly cadNode: CadNode) {}

  registerTransformedNode(
    treeIndex: number,
    currentTransform: THREE.Matrix4,
    originalBoundingBox: THREE.Box3,
    inSectors: number[]
  ): void {
    // Intersect the original node bounding box with the original sector bounds, and store the results for later
    const originalBoundingBoxInSectors = new Map<number, THREE.Box3>();
    inSectors.forEach(sectorId => {
      let originalSectorBounds = this.originalSectorBounds.get(sectorId);
      if (!originalSectorBounds) {
        const nodeMetadata = this.cadNode.sectorScene.getSectorById(sectorId);
        if (!nodeMetadata) {
          throw new Error(`Failed to get sector bounds for sector with id ${sectorId}`);
        }
        originalSectorBounds = nodeMetadata.subtreeBoundingBox;
      }

      const originalBoundingBoxInSector = originalBoundingBox.clone().intersect(originalSectorBounds);
      if (!originalBoundingBoxInSector.isEmpty()) {
        originalBoundingBoxInSectors.set(sectorId, originalBoundingBoxInSector);
      }
    });
    const transformedNode = { currentTransform, originalBoundingBoxInSectors };

    // Update mapping from tree index to transformed node
    this.treeIndexToTransformedNodeMap.set(treeIndex, transformedNode);

    // Update mapping from sector id to transformed nodes
    inSectors.forEach(sectorId => {
      const transformedNodesForSector = this.sectorIdToTransformedNodesMap.get(sectorId);
      if (transformedNodesForSector) {
        transformedNodesForSector.add(transformedNode);
      } else {
        this.sectorIdToTransformedNodesMap.set(sectorId, new Set<TransformedNode>([transformedNode]));
      }

      // Mark sector bounds as dirty
      this.sectorsWithInvalidBounds.add(sectorId);
    });
  }

  unregisterTransformedNode(treeIndex: number): void {
    const transformedNode = this.treeIndexToTransformedNodeMap.get(treeIndex);
    if (transformedNode) {
      // Update mapping from sector id to transformed nodes
      transformedNode.originalBoundingBoxInSectors.forEach((_, sectorId) => {
        this.sectorIdToTransformedNodesMap.get(sectorId)?.delete(transformedNode);

        // Mark sector bounds as dirty
        this.sectorsWithInvalidBounds.add(sectorId);
      });

      // Update mapping from tree index to transformed node
      this.treeIndexToTransformedNodeMap.delete(treeIndex);
    }
  }

  recomputeSectorBounds(): void {
    this.sectorsWithInvalidBounds.forEach(sectorId => {
      const boundingBoxes: THREE.Box3[] = [];
      this.sectorIdToTransformedNodesMap.get(sectorId)?.forEach(transformedNode => {
        const originalBoundingBox = transformedNode.originalBoundingBoxInSectors.get(sectorId);
        if (!originalBoundingBox) {
          throw new Error(`Missing entry for node bounding box in sector ${sectorId}`);
        }

        const effectiveBoundingBox = originalBoundingBox.clone().applyMatrix4(transformedNode.currentTransform);

        boundingBoxes.push(effectiveBoundingBox);
      });

      this.updateSectorBounds(sectorId, boundingBoxes);
    });

    this.sectorsWithInvalidBounds.clear();
  }

  private updateSectorBounds(sectorId: number, shouldContainBoundingBoxes: THREE.Box3[]): void {
    const nodeMetadata = this.cadNode.sectorScene.getSectorById(sectorId);
    if (!nodeMetadata) {
      throw new Error(`Failed to get sector bounds for sector with id ${sectorId}`);
    }

    console.log('updateSectorBounds for sector with id', sectorId, 'and path', nodeMetadata.path);

    // Retrieve original bounds for this sector
    let originalBounds = this.originalSectorBounds.get(sectorId);
    if (!originalBounds) {
      // This is the first time we encounter this sector, and the current bounds must therefore be the original bounds
      originalBounds = nodeMetadata.subtreeBoundingBox.clone();

      // Store the original bounds for future use
      this.originalSectorBounds.set(sectorId, originalBounds);
    }

    // Reset sector bounds back to the original bounds
    const sectorBounds = nodeMetadata.subtreeBoundingBox;
    const before = sectorBounds.clone();
    sectorBounds.copy(originalBounds);

    if (shouldContainBoundingBoxes.length) {
      // Expand to fit all transformed nodes that belong to this sector
      shouldContainBoundingBoxes.forEach(boundingBox => {
        sectorBounds.expandByPoint(boundingBox.min);
        sectorBounds.expandByPoint(boundingBox.max);
      });

      const minExpandedBy = before.min.clone().sub(sectorBounds.min);
      const maxExpandedBy = sectorBounds.max.clone().sub(before.max);
      console.log('Sector bounds min expanded by', minExpandedBy, 'and max expanded by', maxExpandedBy);
    } else {
      // Remove copy of original bounds if the sector now has the original bounds
      this.originalSectorBounds.delete(sectorId);

      console.log('Sector bounds reset');
    }

    // If this sector has a parent, update the bounds of that parent sector as well
    const parentId = this.sectorIdOfParent(nodeMetadata.path);
    if (parentId !== undefined) {
      this.updateSectorBounds(parentId, shouldContainBoundingBoxes);
    }
  }

  private sectorIdOfParent(sectorPath: string): number | undefined {
    const pathElements = sectorPath
      .split('/')
      .filter(x => x.length > 0)
      .map(x => Number(x));

    pathElements.pop();

    if (pathElements.length) {
      // Find parent sector id by traversing children
      let node = this.cadNode.rootSector as SectorNode;
      for (const childIndex of pathElements) {
        node = node.children[childIndex] as SectorNode;
      }
      return node.sectorId;
    }

    return undefined;
  }
}
