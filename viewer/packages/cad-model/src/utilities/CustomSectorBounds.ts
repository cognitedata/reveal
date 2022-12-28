/*!
 * Copyright 2022 Cognite AS
 */

import { SectorNode } from '@reveal/cad-parsers';
import { CadNode } from '../wrappers/CadNode';

interface TransformedNode {
  currentBoundingBox: THREE.Box3;
  inSectors: number[];
}

export class CustomSectorBounds {
  private readonly treeIndexToTransformedNodeMap = new Map<number, TransformedNode>();
  private readonly sectorIdToTransformedNodesMap = new Map<number, Set<TransformedNode>>();
  private readonly originalSectorBounds = new Map<number, THREE.Box3>();
  private readonly sectorsWithInvalidBounds = new Set<number>();

  constructor(private readonly cadNode: CadNode) {}

  registerTransformedNode(treeIndex: number, currentBoundingBox: THREE.Box3, inSectors: number[]): void {
    const transformedNode = { currentBoundingBox, inSectors };

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
      transformedNode.inSectors.forEach(sectorId => {
        this.sectorIdToTransformedNodesMap.get(sectorId)?.delete(transformedNode);

        // Mark sector bounds as dirty
        this.sectorsWithInvalidBounds.add(sectorId);
      });

      // Update mapping from tree index to transformed node
      this.treeIndexToTransformedNodeMap.delete(treeIndex);
    }
  }

  recomputeSectorBounds(): void {
    this.sectorsWithInvalidBounds.forEach(sectorId =>
      this.updateSectorBounds(sectorId, this.sectorIdToTransformedNodesMap.get(sectorId) ?? new Set<TransformedNode>())
    );

    this.sectorsWithInvalidBounds.clear();
  }

  private updateSectorBounds(sectorId: number, transformedNodes: Set<TransformedNode>): void {
    const nodeMetadata = this.cadNode.sectorScene.getSectorById(sectorId);
    if (!nodeMetadata) {
      throw new Error(`Failed to get sector bounds for sector with id ${sectorId}`);
    }

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
    sectorBounds.copy(originalBounds);

    // Expand to fit all transformed nodes that belong to this sector
    transformedNodes.forEach(transformedNode => {
      sectorBounds.expandByPoint(transformedNode.currentBoundingBox.min);
      sectorBounds.expandByPoint(transformedNode.currentBoundingBox.max);
    });

    // If this sector has a parent, update the bounds of that parent sector as well
    const parentId = this.sectorIdOfParent(nodeMetadata.path);
    if (parentId) {
      this.updateSectorBounds(parentId, transformedNodes);
    }
  }

  private sectorIdOfParent(sectorPath: string): number | undefined {
    const pathElements = sectorPath
      .split('/')
      .filter(x => x.length > 0)
      .map(x => Number(x));

    pathElements.pop();

    if (pathElements.length) {
      // Find node id by traversing children
      let node = this.cadNode.rootSector as SectorNode;
      for (const childIndex of pathElements) {
        node = node.children[childIndex] as SectorNode;
      }
      return node.id;
    }

    return undefined;
  }
}
