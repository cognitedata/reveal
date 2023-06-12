/*!
 * Copyright 2023 Cognite AS
 */

import * as THREE from 'three';
import { SectorMetadata } from '@reveal/cad-parsers';
import { CadNode } from '../wrappers/CadNode';

type TransformedNode = {
  currentTransform: THREE.Matrix4;
  originalBoundingBox: THREE.Box3;
  inSectors: Set<number>;
};

// todo: class docs
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
  registerTransformedNode(treeIndex: number, originalBoundingBox: THREE.Box3): void {
    if (this.isRegistered(treeIndex)) {
      throw new Error(`Attempted to register already registered node (tree index ${treeIndex})`);
    }

    // Update mapping from tree index to transformed node
    this._treeIndexToTransformedNodeMap.set(treeIndex, {
      currentTransform: new THREE.Matrix4(),
      originalBoundingBox: originalBoundingBox.clone(),
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
      if (!transformedNode.inSectors.has(newSector)) {
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
        // Compute the intersection between the original sector bounds and the original node bounds
        const originalBoundingBoxInSector = transformedNode.originalBoundingBox
          .clone()
          .intersect(this.getOriginalSectorBounds(sectorId));
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
        //console.log('Indirect sector', sector.id, 'expanded');
      } else {
        this.clearCustomSectorBounds(sector.id);
        //console.log('Indirect sector', sector.id, 'reset');
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
    //console.log('updateSector for sector with id', sectorId);

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

        //const minExpandedBy = newSectorBounds.min.clone().sub(originalSectorBounds.min);
        //const maxExpandedBy = newSectorBounds.max.clone().sub(originalSectorBounds.max);
        //console.log('  Sector bounds min expanded by', minExpandedBy, 'and max expanded by', maxExpandedBy);

        return;
      }
    }

    // Reset sector bounds back to the original bounds
    this.clearCustomSectorBounds(sectorId);

    //console.log('  Sector bounds reset');
  }
  /*
  private inflateAncestorsOf(sectorId: number, sectorsWithCustomBounds: Set<number>): void {
    console.log('  inflateAncestorsOf called on sector', sectorId);
    const parentId = this.sectorIdOfParent(this.sectorMetadata(sectorId).path);
    console.log('    parentId is:', parentId);
    if (parentId !== undefined) {
      const originalParentBounds = this.getOriginalSectorBounds(parentId);

      // Check if the parent has custom bounds. In that case, we should only expand it
      let newParentBounds: THREE.Box3;
      if (sectorsWithCustomBounds.has(parentId)) {
        newParentBounds = this.sectorMetadata(parentId).subtreeBoundingBox.clone();
      } else {
        newParentBounds = originalParentBounds.clone();
      }

      // Compute the new bounding box for this parent by expanding it to fit all the children
      for (const child of this.sectorMetadata(parentId).children) {
        newParentBounds.expandByPoint(child.subtreeBoundingBox.min);
        newParentBounds.expandByPoint(child.subtreeBoundingBox.max);
      }

      // Modify sector bounds
      if (!newParentBounds.equals(originalParentBounds)) {
        this.setCustomSectorBounds(parentId, newParentBounds);
        console.log('    parent bounds set to:', newParentBounds);
      } else {
        this.clearCustomSectorBounds(parentId);
        console.log('    parent bounds reset');
      }

      // Recursively modify all ancestors
      this.inflateAncestorsOf(parentId, sectorsWithCustomBounds);
    }
  }

  private sectorIdOfParent(sectorPath: string): number | undefined {
    const pathElements = sectorPath
      .split('/')
      .filter(x => x.length > 0)
      .map(x => Number(x));

    pathElements.pop(); // Remove one to get the parent

    if (pathElements.length) {
      // Start at root sector
      let node = this.cadNode.rootSector as SectorNode;
      pathElements.shift();

      // And traverse children to reach the desired parent
      for (const childIndex of pathElements) {
        node = node.children[childIndex] as SectorNode;
      }
      return node.sectorId;
    }

    return undefined;
  }
  */

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
