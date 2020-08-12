/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { CogniteClient } from '@cognite/sdk';
import { vec3 } from 'gl-matrix';

import { NodeIdAndTreeIndexMaps } from './NodeIdAndTreeIndexMaps';
import { Color } from './types';
import { CogniteModelBase } from './CogniteModelBase';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import { toThreeJsBox3, toThreeMatrix4, toThreeVector3, fromThreeVector3, NumericRange } from '@/utilities';
import { CadRenderHints, CadNode } from '@/experimental';
import { CadLoadingHints } from '@/datamodels/cad/CadLoadingHints';
import { CadModelMetadata } from '@/datamodels/cad/CadModelMetadata';
import { NodeAppearanceProvider, DefaultNodeAppearance } from '@/datamodels/cad/NodeAppearance';
import { trackError } from '@/utilities/metrics';
import { SupportedModelTypes } from '../types';

const mapCoordinatesBuffers = {
  v: vec3.create()
};

/**
 * Represents a single 3D CAD model loaded from CDF.
 * @noInheritDoc
 */
export class Cognite3DModel extends THREE.Object3D implements CogniteModelBase {
  public readonly type: SupportedModelTypes = 'cad';

  /**
   * Get settings used for rendering.
   */
  get renderHints(): CadRenderHints {
    return this.cadNode.renderHints;
  }

  /**
   * Specify settings for rendering.
   */
  set renderHints(hints: CadRenderHints) {
    this.cadNode.renderHints = hints;
  }

  /**
   * Get settings used for loading pipeline.
   */
  get loadingHints(): CadLoadingHints {
    return this.cadNode.loadingHints;
  }

  /**
   * Specify settings for loading pipeline.
   */
  set loadingHints(hints: CadLoadingHints) {
    this.cadNode.loadingHints = hints;
  }

  /**
   * The CDF model ID of the model.
   */
  readonly modelId: number;
  /**
   * The CDF revision ID of the model.
   */
  readonly revisionId: number;
  /** @internal */
  readonly cadNode: CadNode;

  private readonly cadModel: CadModelMetadata;
  private readonly nodeColors: Map<number, [number, number, number]>;
  private readonly selectedNodes: Set<number>;
  private readonly hiddenNodes: Set<number>;
  private readonly client: CogniteClient;
  private readonly nodeIdAndTreeIndexMaps: NodeIdAndTreeIndexMaps;

  /** @internal */
  constructor(modelId: number, revisionId: number, cadNode: CadNode, client: CogniteClient) {
    super();
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.cadModel = cadNode.cadModelMetadata;
    this.client = client;
    this.nodeColors = new Map();
    this.hiddenNodes = new Set();
    this.selectedNodes = new Set();
    this.nodeIdAndTreeIndexMaps = new NodeIdAndTreeIndexMaps(modelId, revisionId, client);

    const nodeAppearanceProvider: NodeAppearanceProvider = {
      styleNode: (treeIndex: number) => {
        let style = DefaultNodeAppearance.NoOverrides;
        if (this.hiddenNodes.has(treeIndex)) {
          style = { ...style, ...DefaultNodeAppearance.Hidden };
        }
        if (this.nodeColors.has(treeIndex)) {
          style = { ...style, color: this.nodeColors.get(treeIndex) };
        }
        if (this.selectedNodes.has(treeIndex)) {
          style = { ...style, ...DefaultNodeAppearance.Highlighted };
        }
        return style;
      }
    };

    cadNode.materialManager.setNodeAppearanceProvider(this.cadModel.blobUrl, nodeAppearanceProvider);
    cadNode.requestNodeUpdate([...Array(cadNode.sectorScene.maxTreeIndex + 1).keys()]);

    this.cadNode = cadNode;

    this.add(this.cadNode);
  }

  /**
   * Maps a position retrieved from the CDF API (e.g. 3D node information) to
   * coordinates in "ThreeJS model space". This is necessary because CDF has a right-handed
   * Z-up coordinate system while ThreeJS uses a right-hand Y-up coordinate system.
   * @param p     The CDF coordinate to transform
   * @param out   Optional preallocated buffer for storing the result
   */
  mapFromCdfToModelCoordinates(p: THREE.Vector3, out?: THREE.Vector3): THREE.Vector3 {
    out = out !== undefined ? out : new THREE.Vector3();
    const { v } = mapCoordinatesBuffers;
    fromThreeVector3(v, p);
    return toThreeVector3(out, v, this.cadModel.modelTransformation);
  }

  /**
   * Maps from a 3D position in "ThreeJS model space" (e.g. a ray intersection coordinate)
   * to coordinates in "CDF space". This is necessary because CDF has a right-handed
   * Z-up coordinate system while ThreeJS uses a right-hand Y-up coordinate system.
   * @param p       The ThreeJS coordinate to transform
   * @param out     Optional preallocated buffer for storing the result
   */
  mapPositionFromModelToCdfCoordinates(p: THREE.Vector3, out?: THREE.Vector3): THREE.Vector3 {
    out = out !== undefined ? out : new THREE.Vector3();
    const { v } = mapCoordinatesBuffers;
    fromThreeVector3(v, p, this.cadModel.modelTransformation);
    return toThreeVector3(out, v);
  }

  /**
   * Cleans up used resources.
   */
  dispose() {
    this.children = [];
  }

  /**
   * @deprecated
   * @throws NotSupportedInMigrationWrapperError
   */
  getSubtreeNodeIds(_nodeId: number, _subtreeSize?: number): Promise<number[]> {
    throw new NotSupportedInMigrationWrapperError('Use getSubtreeTreeIndices(treeIndex: number)');
  }

  async getSubtreeTreeIndices(treeIndex: number): Promise<number[]> {
    const treeIndices = await this.determineTreeIndices(treeIndex, true);
    return treeIndices.asArray();
  }

  /**
   * @deprecated Use {@link Cognite3DModel.getModelBoundingBox} or {@link Cognite3DModel.getBoundingBoxFromCdf}.
   * @throws NotSupportedInMigrationWrapperError
   */
  getBoundingBox(_nodeId?: number, _box?: THREE.Box3): THREE.Box3 {
    throw new NotSupportedInMigrationWrapperError('Use getBoundingBoxFromCdf(nodeId: number) or getModelBoundingBox()');
  }

  /**
   * Determines the full bounding box of the model.
   * @param outBbox Optional. Used to write result to.
   * @returns models bounding box.
   * @example
   * ```js
   * const box = new THREE.Box3()
   * model.getModelBoundingBox(box);
   * // box now has the bounding box
   *```
   * ```js
   * // the following code does the same
   * const box = model.getModelBoundingBox();
   * ```
   */
  getModelBoundingBox(outBbox?: THREE.Box3): THREE.Box3 {
    const bounds = this.cadModel.scene.root.bounds;
    return toThreeJsBox3(outBbox || new THREE.Box3(), bounds, this.cadModel.modelTransformation);
  }

  /**
   * Apply transformation matrix to the model.
   * @param matrix Matrix to be applied.
   * @internal
   */
  updateTransformation(matrix: THREE.Matrix4): void {
    this.cadNode.applyMatrix4(matrix);
    this.cadNode.updateMatrixWorld(false);
  }

  /** @internal */
  updateNodeIdMaps(sector: Map<number, number>) {
    this.nodeIdAndTreeIndexMaps.updateMaps(sector);
  }

  /**
   * Fetches a bounding box from the CDF by the nodeId.
   * @param nodeId
   * @param box Optional. Used to write result to.
   * @example
   * ```js
   * const box = new THREE.Box3()
   * const nodeId = 100500;
   * model.getBoundingBoxFromCdf(nodeId, box);
   * // box now has the bounding box
   *```
   * ```js
   * // the following code does the same
   * const box = model.getBoundingBoxFromCdf(nodeId);
   * ```
   */
  async getBoundingBoxFromCdf(nodeId: number, box?: THREE.Box3): Promise<THREE.Box3> {
    const response = await this.client.revisions3D.retrieve3DNodes(this.modelId, this.revisionId, [{ id: nodeId }]);
    if (response.length < 1) {
      throw new Error('NodeId not found');
    }
    const boundingBox3D = response[0].boundingBox;
    if (boundingBox3D === undefined) {
      trackError(new Error(`Node ${nodeId} doesn't have a defined bounding box, returning model bounding box`), {
        moduleName: 'Cognite3DModel',
        methodName: Cognite3DModel.prototype.getBoundingBoxFromCdf.name
      });
      return this.getModelBoundingBox();
    }

    const min = boundingBox3D.min;
    const max = boundingBox3D.max;
    const result = box || new THREE.Box3();
    result.min.set(min[0], min[1], min[2]);
    result.max.set(max[0], max[1], max[2]);
    return result.applyMatrix4(toThreeMatrix4(this.cadModel.modelTransformation.modelMatrix));
  }

  /**
   * @deprecated Use {@link Cognite3DModel.iterateNodesByTreeIndex} instead.
   * @throws NotSupportedInMigrationWrapperError
   */
  iterateNodes(_action: (nodeId: number, treeIndex?: number) => void): void {
    throw new NotSupportedInMigrationWrapperError('Use iterateNodesByTreeIndex(action: (treeIndex: number) => void)');
  }

  /**
   * @param action Function that will be called with a treeIndex argument.
   * @example
   * ```js
   * const logIndex = (treeIndex) => console.log(treeIndex);
   * model.iterateNodesByTreeIndex(logIndex); // 0, 1, 2, ...
   * ```
   */
  iterateNodesByTreeIndex(action: (treeIndex: number) => void): void {
    for (let i = 0; i < this.cadModel.scene.maxTreeIndex; i++) {
      action(i);
    }
  }

  /**
   * @deprecated Use {@link Cognite3DModel.iterateNodesByTreeIndex} instead.
   * @throws NotSupportedInMigrationWrapperError
   */
  iterateSubtree(
    _nodeId: number,
    _action: (nodeId: number, treeIndex?: number) => void,
    _treeIndex?: number,
    _subtreeSize?: number
  ): Promise<boolean> {
    throw new NotSupportedInMigrationWrapperError(
      'Use iterateSubtreeByTreeIndex(treeIndex: number, action: (treeIndex: number) => void)'
    );
  }
  async iterateSubtreeByTreeIndex(treeIndex: number, action: (treeIndex: number) => void): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, true);
    treeIndices.forEach(action);
    return treeIndices.count;
  }

  /**
   * Get node color by nodeId. You can only get those colors, that you've set with
   * {@link Cognite3DModel.setNodeColor} or {@link Cognite3DModel.setNodeColorByTreeIndex}.
   * Otherwise `{ r: 255, g: 255, b: 255 }` is returned as the fallback.
   * @param nodeId
   * @example
   * ```js
   * let color = model.getNodeColor(nodeId);
   * ```
   */
  async getNodeColor(nodeId: number): Promise<Color> {
    try {
      const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
      const color = this.nodeColors.get(treeIndex);
      if (!color) {
        // TODO: migration wrapper currently does not support looking up colors not set by the user
        throw new NotSupportedInMigrationWrapperError();
      }
      const [r, g, b] = color;
      return {
        r,
        g,
        b
      };
    } catch (error) {
      trackError(error, {
        moduleName: 'Cognite3DModel',
        methodName: 'getNodeColor'
      });
      return {
        r: 255,
        g: 255,
        b: 255
      };
    }
  }

  /**
   * Set node color by node ID.
   * This method is async because nodeId might be not loaded yet.
   * @deprecated Use {@link Cognite3DModel.setNodeColorByTreeIndex}
   * @param nodeId
   * @param r       Red component (0-255)
   * @param g       Green component (0-255)
   * @param b       Blue componenet (0-255)
   */
  async setNodeColor(nodeId: number, r: number, g: number, b: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    await this.setNodeColorByTreeIndex(treeIndex, r, g, b);
  }

  /**
   * Update color of a 3D node identified by it's tree index.
   * @param treeIndex       Tree index of the node to update
   * @param r               Red component (0-255)
   * @param g               Green component (0-255)
   * @param b               Blue component (0-255)
   * @param applyToChildren When true, the color will be applied to all descendants
   * @returns               Promise that resolves to number of nodes affected
   */
  async setNodeColorByTreeIndex(
    treeIndex: number,
    r: number,
    g: number,
    b: number,
    applyToChildren = false
  ): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    const color: [number, number, number] = [r, g, b];
    treeIndices.forEach(idx => this.nodeColors.set(idx, color));
    this.cadNode.requestNodeUpdate(treeIndices);
    return treeIndices.count;
  }

  /**
   * Set original node color by node ID.
   * This method is async because node ID might be not loaded yet.
   * @deprecated {@link Cognite3DModel.resetNodeColorByTreeIndex}
   * @param nodeId
   */
  async resetNodeColor(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    await this.resetNodeColorByTreeIndex(treeIndex);
  }

  /**
   * Set original node color by tree index.
   * @param treeIndex
   */
  async resetNodeColorByTreeIndex(treeIndex: number, applyToChildren = false): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    treeIndices.forEach(idx => this.nodeColors.delete(idx));
    this.cadNode.requestNodeUpdate(treeIndices);
    return treeIndices.count;
  }

  /**
   * Restore original colors for all nodes.
   */
  resetAllNodeColors() {
    const treeIndices = [...this.nodeColors.keys()];
    this.nodeColors.clear();
    this.cadNode.requestNodeUpdate(treeIndices);
  }

  /**
   * Highlight node by node ID.
   * This method is async because node ID might be not loaded yet.
   * @deprecated {@link Use Cognite3DModel.selectNodeByTreeIndex}
   * @param nodeId
   */
  async selectNode(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.selectNodeByTreeIndex(treeIndex);
  }

  /**
   * Highlight node by tree index.
   * @param treeIndex
   */
  async selectNodeByTreeIndex(treeIndex: number, applyToChildren = false): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    treeIndices.forEach(idx => this.selectedNodes.add(idx));
    this.cadNode.requestNodeUpdate(treeIndices);
    return treeIndices.count;
  }

  /**
   * Removes selection from the node by node ID
   */
  async deselectNode(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    await this.deselectNodeByTreeIndex(treeIndex);
  }

  /**
   * Removes selection from the node by tree index
   */
  async deselectNodeByTreeIndex(treeIndex: number, applyToChildren = false): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    treeIndices.forEach(idx => this.selectedNodes.delete(idx));
    this.cadNode.requestNodeUpdate(treeIndices);
    return treeIndices.count;
  }

  /**
   * Removes selection from all nodes.
   */
  deselectAllNodes(): void {
    const selectedNodes = Array.from(this.selectedNodes);
    this.selectedNodes.clear();
    this.cadNode.requestNodeUpdate(selectedNodes);
  }

  /**
   * Show the node by node ID, that was hidden by {@link Cognite3DModel.hideNodeByTreeIndex},
   * {@link Cognite3DModel.hideNode} or {@link Cognite3DModel.hideAllNodes}
   * This method is async because nodeId might be not loaded yet.
   * @deprecated Use {@link Cognite3DModel.showNodeByTreeIndex}
   * @param nodeId
   * @example
   * ```js
   * model.hideAllNodes();
   * model.showNode(nodeId);
   * ```
   */
  async showNode(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.showNodeByTreeIndex(treeIndex);
  }

  /**
   * Show the node by tree index, that was hidden by {@link Cognite3DModel.hideNodeByTreeIndex},
   * {@link Cognite3DModel.hideNode} or {@link Cognite3DModel.hideAllNodes}
   * @param treeIndex
   */
  async showNodeByTreeIndex(treeIndex: number, applyToChildren = false): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    this.hiddenNodes.delete(treeIndex);
    this.cadNode.requestNodeUpdate([treeIndex]);
    return treeIndices.count;
  }

  /**
   * Show all the nodes that were hidden by {@link Cognite3DModel.hideNodeByTreeIndex},
   * {@link Cognite3DModel.hideNode} or {@link Cognite3DModel.hideAllNodes}
   */
  showAllNodes(): void {
    const wasHidden = Array.from(this.hiddenNodes.values());
    this.hiddenNodes.clear();
    this.cadNode.requestNodeUpdate(wasHidden);
  }

  /**
   * Hides all nodes in the model.
   * @param makeGray Not supported.
   * @throws NotSupportedInMigrationWrapperError if `makeGray` is passed
   */
  hideAllNodes(makeGray?: boolean): void {
    if (makeGray) {
      throw new NotSupportedInMigrationWrapperError('makeGray is not supported');
    }
    for (let i = 0; i < this.cadModel.scene.maxTreeIndex; i++) {
      this.hiddenNodes.add(i);
    }
    this.cadNode.requestNodeUpdate(Array.from(this.hiddenNodes.values()));
  }

  /**
   * Hide the node by node ID.
   * This method is async because nodeId might be not loaded yet.
   * @deprecated Use {@link Cognite3DModel.hideNodeByTreeIndex}
   * @param nodeId
   * @param makeGray Not supported yet.
   */
  async hideNode(nodeId: number, makeGray?: boolean): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    await this.hideNodeByTreeIndex(treeIndex, makeGray);
  }

  /**
   * Hide the node by tree index.
   * @param treeIndex
   * @param makeGray Not supported.
   * @throws NotSupportedInMigrationWrapperError if `makeGray` is passed
   */
  async hideNodeByTreeIndex(treeIndex: number, makeGray?: boolean, applyToChildren = false): Promise<number> {
    if (makeGray) {
      throw new NotSupportedInMigrationWrapperError('makeGray is not supported');
    }
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    treeIndices.forEach(idx => this.hiddenNodes.add(idx));
    this.cadNode.requestNodeUpdate(treeIndices);
    return treeIndices.count;
  }

  /** @internal */
  tryGetNodeId(treeIndex: number): number | undefined {
    return this.nodeIdAndTreeIndexMaps.getNodeId(treeIndex);
  }

  /**
   * Maps a list of Node IDs to tree indices for use with the API.
   * This function is useful when you have a list of nodes, e.g. from
   * Asset Mappings, that you want to highlight, hide, color etc in the viewer.
   *
   * @param nodeIds List of node IDs to map to tree indices.
   * @returns A list of tree indices corresponing to the elements in the input.
   * @throws If an invalid node ID is provided the function throws an error.
   */
  async mapNodeIdsToTreeIndices(nodeIds: number[]): Promise<number[]> {
    return this.nodeIdAndTreeIndexMaps.getTreeIndices(nodeIds);
  }

  private async determineTreeIndices(treeIndex: number, includeDescendants: boolean): Promise<NumericRange> {
    let subtreeSize = 1;
    if (includeDescendants) {
      const subtreeSizePromise = await this.nodeIdAndTreeIndexMaps.getSubtreeSize(treeIndex);
      subtreeSize = subtreeSizePromise !== undefined ? subtreeSizePromise : 1;
    }
    return new NumericRange(treeIndex, subtreeSize);
  }
}
