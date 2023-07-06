/*!
 * Copyright 2023 Cognite AS
 */

import * as THREE from 'three';
import { SectorMetadata } from '@reveal/cad-parsers';
import { CadNode } from '../wrappers/CadNode';

type TransformedNode = {
  currentTransform: THREE.Matrix4;
  originalBoundingBox?: THREE.Box3;
  inSectors: Set<number>;
};

/**
 * An instance of this class is used to dynamically alter the sector bounding boxes to adapt to custom node transforms.
 * The bounding box of a sector is kept equal to its original value, unless:
 * - A node with geometry in the sector is transformed such that the original bounds would not fully contain the node geometry
 * - Descendants of the sector have grown, and are no longer contained within the original bounds.
 * The set of sectors a tree index has geometry in does not need to be known upfront. This set of sectors, and the node transform,
 * are set independently of each other.
 */
export class CustomSectorBounds {
  private readonly _treeIndexToTransformedNodeMap = new Map<number, TransformedNode>();
  private readonly _sectorIdToTransformedNodesMap = new Map<number, Set<TransformedNode>>();
  private readonly _originalSectorBounds = new Map<number, THREE.Box3>();
  private readonly _sectorsWithInvalidBounds = new Set<number>();
  private readonly _allSectorsSortedByDepth: SectorMetadata[];

  constructor(private readonly cadNode: CadNode) {
    // Store all sectors by descending depth, used to iterate over all sectors in a "child before parent"-fashion.
    this._allSectorsSortedByDepth = this.cadNode.sectorScene.getAllSectors();
    this._allSectorsSortedByDepth.sort((a, b) => b.depth - a.depth);
  }

  /**
   * Returns whether or not the given node is registered
   * @param treeIndex Tree index of the node to check
   * @returns True if node is registered, false otherwise
   */
  isRegistered(treeIndex: number): boolean {
    return this._treeIndexToTransformedNodeMap.has(treeIndex);
  }

  /**
   * Registers a node as transformed, meaning it'll be taken into account when sector bounds are recomputed
   * @param treeIndex Tree index of the transformed node
   * @param originalBoundingBox The original bounding box of this node
   */
  registerTransformedNode(treeIndex: number, originalBoundingBox?: THREE.Box3): void {
    if (this.isRegistered(treeIndex)) {
      throw new Error(`Attempted to register already registered node (tree index ${treeIndex})`);
    }

    // Update mapping from tree index to transformed node
    this._treeIndexToTransformedNodeMap.set(treeIndex, {
      currentTransform: new THREE.Matrix4(),
      originalBoundingBox: originalBoundingBox?.clone(),
      inSectors: new Set<number>()
    });
  }

  /**
   * Updates the transform for a registered node. Sector bounds will not be changed until recomputeSectorBounds() is called
   * @param treeIndex Tree index of the transformed node
   * @param newTransform The transform
   */
  updateNodeTransform(treeIndex: number, newTransform: THREE.Matrix4): void {
    const transformedNode = this._treeIndexToTransformedNodeMap.get(treeIndex);
    if (!transformedNode) {
      throw new Error(`Attempted to update transform for non-registered node (tree index ${treeIndex})`);
    }

    if (!transformedNode.currentTransform.equals(newTransform)) {
      // Update transform
      transformedNode.currentTransform.copy(newTransform);

      // Mark affected sectors as dirty, to be updated during the next recomputeSectorBounds() call
      transformedNode.inSectors.forEach(sectorId => this._sectorsWithInvalidBounds.add(sectorId));
    }
  }

  /**
   * Updates the set of sectors a node is known to have geometry in. Addition of new sectors is the only possible operation.
   * Sector bounds will not be changed until recomputeSectorBounds() is called
   * @param treeIndex Tree index of the transformed node
   * @param newSectors The new sector(s) that this node is discovered to have geometry in
   */
  updateNodeSectors(treeIndex: number, newSectors: number[]): void {
    const transformedNode = this._treeIndexToTransformedNodeMap.get(treeIndex);
    if (!transformedNode) {
      throw new Error(`Attempted to update node sectors for non-registered node (tree index ${treeIndex})`);
    }

    for (const newSector of newSectors) {
      if (transformedNode.inSectors.has(newSector)) {
        continue;
      }

      // Add sector to transformed node
      transformedNode.inSectors.add(newSector);

      // Update mapping from sector to transformed nodes
      const transformedNodesForSector = this._sectorIdToTransformedNodesMap.get(newSector);
      if (transformedNodesForSector) {
        transformedNodesForSector.add(transformedNode);
      } else {
        this._sectorIdToTransformedNodesMap.set(newSector, new Set<TransformedNode>([transformedNode]));
      }

      // Mark sector as dirty, to be updated during the next recomputeSectorBounds() call
      this._sectorsWithInvalidBounds.add(newSector);
    }
  }

  /**
   * Unregisters a node, meaning it will no longer be taken into account when sector bounds are recomputed
   * @param treeIndex Tree index of the node to be unregistered
   */
  unregisterTransformedNode(treeIndex: number): void {
    const transformedNode = this._treeIndexToTransformedNodeMap.get(treeIndex);
    if (!transformedNode) {
      throw new Error(`Attempted to unregister non-registered node (tree index ${treeIndex})`);
    }

    // Update mapping from sector id to transformed nodes
    transformedNode.inSectors.forEach(sectorId => {
      this._sectorIdToTransformedNodesMap.get(sectorId)?.delete(transformedNode);

      // Mark sector as dirty
      this._sectorsWithInvalidBounds.add(sectorId);
    });

    // Update mapping from tree index to transformed node
    this._treeIndexToTransformedNodeMap.delete(treeIndex);
  }

  /**
   * Recomputes the sector bounds making all registered nodes fully contained in their respective sectors. This
   * is the only time the sector bounds are actually altered.
   */
  recomputeSectorBounds(): void {
    this._sectorsWithInvalidBounds.forEach(sectorId => {
      // Compute the bounding boxes for the transformed nodes in this sector
      const boundingBoxes: THREE.Box3[] = [];
      this._sectorIdToTransformedNodesMap.get(sectorId)?.forEach(transformedNode => {
        // Compute the intersection between the original sector bounds and the original node bounds if available,
        // otherwise just assume the node has geometry in the entire sector
        const originalSectorBounds = this.getOriginalSectorBounds(sectorId);
        const originalBoundingBoxInSector =
          transformedNode.originalBoundingBox?.clone().intersect(originalSectorBounds) ?? originalSectorBounds.clone();

        if (!originalBoundingBoxInSector.isEmpty()) {
          // Apply the current transform to this box, giving us the relevant bounds that the sector should currently contain
          const effectiveBoundingBox = originalBoundingBoxInSector
            .clone()
            .applyMatrix4(transformedNode.currentTransform);

          boundingBoxes.push(effectiveBoundingBox);
        }
      });

      this.updateSector(sectorId, boundingBoxes);
    });

    this._sectorsWithInvalidBounds.clear();

    // Iterate over all sectors by descending depth
    for (const sector of this._allSectorsSortedByDepth) {
      const containsTransformedNodes = !!this._sectorIdToTransformedNodesMap.get(sector.id)?.size;
      const originalBoundingBox = this.getOriginalSectorBounds(sector.id);
      const minimumBounds = containsTransformedNodes ? sector.subtreeBoundingBox.clone() : originalBoundingBox.clone();

      sector.children.forEach(child => {
        minimumBounds.expandByPoint(child.subtreeBoundingBox.min);
        minimumBounds.expandByPoint(child.subtreeBoundingBox.max);
      });

      if (!minimumBounds.equals(originalBoundingBox)) {
        this.setCustomSectorBounds(sector.id, minimumBounds);
      } else {
        this.clearCustomSectorBounds(sector.id);
      }
    }
  }

  /**
   * Sets the bounding box of a given sector by expanding the original bounds to include the given custom bounding boxes
   * @param sectorId The sector id
   * @param customBoundingBoxes An array of bounding boxes this sector should contain
   * @returns True if the new sector bounds are different from the original values. False otherwise
   */
  private updateSector(sectorId: number, customBoundingBoxes: THREE.Box3[]): void {
    const originalSectorBounds = this.getOriginalSectorBounds(sectorId);

    if (customBoundingBoxes.length) {
      const newSectorBounds = originalSectorBounds.clone();

      // Expand to fit all transformed nodes that belong to this sector
      customBoundingBoxes.forEach(boundingBox => {
        newSectorBounds.expandByPoint(boundingBox.min);
        newSectorBounds.expandByPoint(boundingBox.max);
      });

      if (!newSectorBounds.equals(originalSectorBounds)) {
        this.setCustomSectorBounds(sectorId, newSectorBounds);
        return;
      }
    }

    // Reset sector bounds back to the original bounds
    this.clearCustomSectorBounds(sectorId);
  }

  private getOriginalSectorBounds(sectorId: number): THREE.Box3 {
    let originalSectorBounds = this._originalSectorBounds.get(sectorId);
    if (!originalSectorBounds) {
      originalSectorBounds = this.sectorMetadata(sectorId).subtreeBoundingBox.clone();
    }
    return originalSectorBounds;
  }

  private setCustomSectorBounds(sectorId: number, customBounds: THREE.Box3): void {
    const sectorMetadata = this.sectorMetadata(sectorId);

    const existingOriginal = this._originalSectorBounds.get(sectorId);
    if (!existingOriginal) {
      // If no original is stored, the sector must currently have original bounds
      this._originalSectorBounds.set(sectorId, sectorMetadata.subtreeBoundingBox.clone());
    }

    // Modify sector bounds
    sectorMetadata.subtreeBoundingBox.copy(customBounds);
  }

  private clearCustomSectorBounds(sectorId: number): void {
    const originalBounds = this._originalSectorBounds.get(sectorId);
    if (originalBounds) {
      // Modify sector bounds
      this.sectorMetadata(sectorId).subtreeBoundingBox.copy(originalBounds);

      // Remove copy of original bounds
      this._originalSectorBounds.delete(sectorId);
    }
  }

  private sectorMetadata(sectorId: number): SectorMetadata {
    const sectorMetadata = this.cadNode.sectorScene.getSectorById(sectorId);
    if (!sectorMetadata) {
      throw new Error(`Failed to get sector metadata for sector with id ${sectorId}`);
    }
    return sectorMetadata;
  }
}
