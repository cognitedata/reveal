/*!
 * Copyright 2020 Cognite AS
 */
import * as THREE from 'three';
import { CogniteClient, CogniteInternalId } from '@cognite/sdk';

import { NodeIdAndTreeIndexMaps } from './NodeIdAndTreeIndexMaps';
import { Color, CameraConfiguration } from './types';
import { CogniteModelBase } from './CogniteModelBase';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import { toThreeJsBox3, NumericRange } from '@/utilities';
import { CadRenderHints, CadNode } from '@/experimental';
import { CadLoadingHints } from '@/datamodels/cad/CadLoadingHints';
import { CadModelMetadata } from '@/datamodels/cad/CadModelMetadata';
import { NodeAppearanceProvider, DefaultNodeAppearance } from '@/datamodels/cad/NodeAppearance';
import { trackError } from '@/utilities/metrics';
import { SupportedModelTypes } from '../types';
import { callActionWithIndicesAsync } from '@/utilities/callActionWithIndicesAsync';
import { CogniteClientNodeIdAndTreeIndexMapper } from '@/utilities/networking/CogniteClientNodeIdAndTreeIndexMapper';

const mapCoordinatesBuffers = {
  inverseModelMatrix: new THREE.Matrix4()
};

/**
 * Represents a single 3D CAD model loaded from CDF.
 * @noInheritDoc
 * @module @cognite/reveal
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
  private readonly nodeTransforms: Map<number, THREE.Matrix4>;

  private readonly selectedNodes: Set<number>;
  private readonly hiddenNodes: Set<number>;
  private readonly ghostedNodes: Set<number>;
  private readonly client: CogniteClient;
  private readonly nodeIdAndTreeIndexMaps: NodeIdAndTreeIndexMaps;

  /**
   * @param modelId
   * @param revisionId
   * @param cadNode
   * @param client
   * @internal
   */
  constructor(modelId: number, revisionId: number, cadNode: CadNode, client: CogniteClient) {
    super();
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.cadModel = cadNode.cadModelMetadata;
    this.client = client;
    this.nodeColors = new Map();
    this.nodeTransforms = new Map();
    this.hiddenNodes = new Set();
    this.selectedNodes = new Set();
    this.ghostedNodes = new Set();
    const indexMapper = new CogniteClientNodeIdAndTreeIndexMapper(client);
    this.nodeIdAndTreeIndexMaps = new NodeIdAndTreeIndexMaps(modelId, revisionId, client, indexMapper);

    const nodeAppearanceProvider: NodeAppearanceProvider = {
      styleNode: (treeIndex: number) => {
        let style = DefaultNodeAppearance.NoOverrides;
        if (this.hiddenNodes.has(treeIndex)) {
          style = { ...style, ...DefaultNodeAppearance.Hidden };
        }
        if (this.nodeColors.has(treeIndex)) {
          style = { ...style, color: this.nodeColors.get(treeIndex) };
        }
        if (this.ghostedNodes.has(treeIndex)) {
          style = { ...style, ...DefaultNodeAppearance.Ghosted };
        }
        if (this.selectedNodes.has(treeIndex)) {
          style = { ...style, ...DefaultNodeAppearance.Highlighted };
        }
        if (this.nodeTransforms.has(treeIndex)) {
          style = { ...style, worldTransform: this.nodeTransforms.get(treeIndex)! };
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
   * @param p     The CDF coordinate to transform.
   * @param out   Optional preallocated buffer for storing the result.
   */
  mapFromCdfToModelCoordinates(p: THREE.Vector3, out?: THREE.Vector3): THREE.Vector3 {
    out = out !== undefined ? out : new THREE.Vector3();
    out.copy(p);
    p.applyMatrix4(this.cadModel.modelMatrix);
    return p;
  }

  /**
   * Maps from a 3D position in "ThreeJS model space" (e.g. a ray intersection coordinate)
   * to coordinates in "CDF space". This is necessary because CDF has a right-handed
   * Z-up coordinate system while ThreeJS uses a right-hand Y-up coordinate system.
   * @param p       The ThreeJS coordinate to transform.
   * @param out     Optional preallocated buffer for storing the result.
   */
  mapPositionFromModelToCdfCoordinates(p: THREE.Vector3, out?: THREE.Vector3): THREE.Vector3 {
    // fixme: unused
    out = out !== undefined ? out : new THREE.Vector3();
    const { inverseModelMatrix } = mapCoordinatesBuffers;
    // TODO 2020-09-10 larsmoa: Avoid creating the inverse every time
    inverseModelMatrix.getInverse(this.cadModel.modelMatrix);
    p.applyMatrix4(inverseModelMatrix);
    return p;
  }

  /**
   * Cleans up used resources.
   */
  dispose() {
    this.children = [];
  }

  /**
   * @param _nodeId
   * @param _subtreeSize
   * @deprecated
   * @throws NotSupportedInMigrationWrapperError.
   */
  getSubtreeNodeIds(_nodeId: number, _subtreeSize?: number): Promise<number[]> {
    throw new NotSupportedInMigrationWrapperError('Use getSubtreeTreeIndices(treeIndex: number)');
  }

  /**
   * Get array of subtree tree indices.
   * @param treeIndex
   */
  async getSubtreeTreeIndices(treeIndex: number): Promise<number[]> {
    const treeIndices = await this.determineTreeIndices(treeIndex, true);
    return treeIndices.toArray();
  }

  /**
   * @param _nodeId
   * @param _box
   * @deprecated Use {@link Cognite3DModel.getModelBoundingBox} or {@link Cognite3DModel.getBoundingBoxByTreeIndex}.
   * @throws NotSupportedInMigrationWrapperError.
   */
  getBoundingBox(_nodeId?: number, _box?: THREE.Box3): THREE.Box3 {
    throw new NotSupportedInMigrationWrapperError(
      'Use getBoundingboxByTreeIndex(treeIndex: number), getBoundingBoxByNodeId(nodeId: number) or getModelBoundingBox()'
    );
  }

  /**
   * Determines the full bounding box of the model.
   * @param outBbox Optional. Used to write result to.
   * @returns Models bounding box.
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
    outBbox = outBbox || new THREE.Box3();
    toThreeJsBox3(outBbox, bounds);
    outBbox.applyMatrix4(this.cadModel.modelMatrix);
    return outBbox;
  }

  /**
   * Retrieves the camera position and target stored for the model. Typically this
   * is used to store a good starting position for a model. Returns `undefined` if there
   * isn't any stored camera configuration for the model.
   */
  getCameraConfiguration(): CameraConfiguration | undefined {
    return this.cadModel.cameraConfiguration;
  }

  /**
   * Sets transformation matrix of the model. This overrides the current transformation.
   * @param matrix Transformation matrix.
   */
  setModelTransformation(matrix: THREE.Matrix4): void {
    this.cadNode.setModelTransformation(matrix);
  }

  /**
   * Gets transformation matrix of the model.
   * @param out Preallocated `THREE.Matrix4` (optional).
   */
  getModelTransformation(out?: THREE.Matrix4): THREE.Matrix4 {
    return this.cadNode.getModelTransformation(out);
  }

  /**
   * @param sector
   * @internal
   */
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
   * await model.getBoundingBoxByNodeId(nodeId, box);
   * // box now has the bounding box
   *```
   * ```js
   * // the following code does the same
   * const box = await model.getBoundingBoxByNodeId(nodeId);
   * ```
   */
  async getBoundingBoxByNodeId(nodeId: number, box?: THREE.Box3): Promise<THREE.Box3> {
    // TODO 2020-08-13 larsmoa: Implement getBoundingBoxByTreeIndex
    const response = await this.client.revisions3D.retrieve3DNodes(this.modelId, this.revisionId, [{ id: nodeId }]);
    if (response.length < 1) {
      throw new Error('NodeId not found');
    }
    const boundingBox3D = response[0].boundingBox;
    if (boundingBox3D === undefined) {
      trackError(new Error(`Node ${nodeId} doesn't have a defined bounding box, returning model bounding box`), {
        moduleName: 'Cognite3DModel',
        methodName: 'getBoundingBoxByNodeId'
      });
      return this.getModelBoundingBox();
    }

    const min = boundingBox3D.min;
    const max = boundingBox3D.max;
    const result = box || new THREE.Box3();
    result.min.set(min[0], min[1], min[2]);
    result.max.set(max[0], max[1], max[2]);
    return result.applyMatrix4(this.cadModel.modelMatrix);
  }

  /**
   * Determine the bounding box of the node identified by the tree index provided. Note that this
   * function uses the CDF API to look up the bounding box.
   * @param treeIndex Tree index of the node to find bounding box for.
   * @param box Optional preallocated container to hold the bounding box.
   * @example
   * ```js
   * const box = new THREE.Box3()
   * const treeIndex = 42;
   * await model.getBoundingBoxByTreeIndex(treeIndex, box);
   * // box now has the bounding box
   *```
   * ```js
   * // the following code does the same
   * const box = await model.getBoundingBoxByTreeIndex(treeIndex);
   * ```
   */
  async getBoundingBoxByTreeIndex(treeIndex: number, box?: THREE.Box3): Promise<THREE.Box3> {
    const nodeId = await this.nodeIdAndTreeIndexMaps.getNodeId(treeIndex);
    return this.getBoundingBoxByNodeId(nodeId, box);
  }

  /**
   * @param _action
   * @deprecated Use {@link Cognite3DModel.iterateNodesByTreeIndex} instead.
   * @throws NotSupportedInMigrationWrapperError.
   */
  iterateNodes(_action: (nodeId: number, treeIndex?: number) => void): void {
    throw new NotSupportedInMigrationWrapperError('Use iterateNodesByTreeIndex(action: (treeIndex: number) => void)');
  }

  /**
   * Iterates over all nodes in the model and applies the provided action to each node (identified by tree index).
   * The passed action is applied incrementally to avoid main thread blocking, meaning that the changes can be partially
   * applied until promise is resolved (iteration is done).
   * @param action Function that will be called with a treeIndex argument.
   * @returns Promise that is resolved once the iteration is done.
   * @example
   * ```js
   * const logIndex = (treeIndex) => console.log(treeIndex);
   * await model.iterateNodesByTreeIndex(logIndex); // 0, 1, 2, ...
   * ```
   */
  iterateNodesByTreeIndex(action: (treeIndex: number) => void): Promise<void> {
    return callActionWithIndicesAsync(0, this.cadModel.scene.maxTreeIndex - 1, action);
  }

  /**
   * @param _nodeId
   * @param _action
   * @param _treeIndex
   * @param _subtreeSize
   * @deprecated Use {@link Cognite3DModel.iterateNodesByTreeIndex} instead.
   * @throws NotSupportedInMigrationWrapperError.
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

  /**
   * Iterates over all nodes in a subtree of the model and applies the provided action to each node
   * (identified by tree index). The provided node is included in the visited set.  The passed action
   * is applied incrementally to avoid main thread blocking, meaning that the changes can be partially
   * applied until promise is resolved (iteration is done).
   * @param treeIndex Tree index of the top parent of the subtree.
   * @param action Function that will be called with a treeIndex argument.
   * @returns Promise that is resolved once the iteration is done.
   * @example
   * ```js
   * // make a subtree to be gray
   * await model.iterateNodesByTreeIndex(treeIndex => {
   *   model.setNodeColorByTreeIndex(treeIndex, 127, 127, 127);
   * });
   * ```
   */
  async iterateSubtreeByTreeIndex(treeIndex: number, action: (treeIndex: number) => void): Promise<void> {
    const treeIndices = await this.determineTreeIndices(treeIndex, true);
    return callActionWithIndicesAsync(treeIndices.from, treeIndices.toInclusive, action);
  }

  /**
   * Not supported.
   * @param _nodeId
   * @deprecated This function is no longer supported. There is no replacement.
   * @throws NotSupportedInMigrationWrapperError.
   */
  getNodeColor(_nodeId: number): Promise<Color> {
    throw new NotSupportedInMigrationWrapperError('getNodeColor() is not supported');
  }

  /**
   * Set node color by node ID.
   * This method is async because nodeId might be not loaded yet.
   * @deprecated Use {@link Cognite3DModel.setNodeColorByTreeIndex}.
   * @param nodeId
   * @param r       Red component (0-255).
   * @param g       Green component (0-255).
   * @param b       Blue componenet (0-255).
   */
  async setNodeColor(nodeId: number, r: number, g: number, b: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    await this.setNodeColorByTreeIndex(treeIndex, r, g, b);
  }

  /**
   * Update color of a 3D node identified by it's tree index.
   * @param treeIndex       Tree index of the node to update.
   * @param r               Red component (0-255).
   * @param g               Green component (0-255).
   * @param b               Blue component (0-255).
   * @param applyToChildren When true, the color will be applied to all descendants.
   * @returns               Promise that resolves to number of nodes affected.
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
    await treeIndices.forEach(idx => this.nodeColors.set(idx, color));
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
   * @param applyToChildren
   */
  async resetNodeColorByTreeIndex(treeIndex: number, applyToChildren = false): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    await treeIndices.forEach(idx => this.nodeColors.delete(idx));
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
   * @param nodeId
   * @deprecated Use {@link Cognite3DModel.selectNodeByTreeIndex}.
   */
  async selectNode(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    await this.selectNodeByTreeIndex(treeIndex);
  }

  /**
   * Highlight node by tree index.
   * @param treeIndex
   * @param applyToChildren
   * @returns Promise with a number of selected tree indices.
   */
  async selectNodeByTreeIndex(treeIndex: number, applyToChildren = false): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    await treeIndices.forEach(idx => this.selectedNodes.add(idx));
    this.cadNode.requestNodeUpdate(treeIndices);
    return treeIndices.count;
  }

  /**
   * Removes selection from the node by node ID.
   * @param nodeId
   */
  async deselectNode(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    await this.deselectNodeByTreeIndex(treeIndex);
  }

  /**
   * Removes selection from the node by tree index.
   * @param treeIndex
   * @param applyToChildren
   */
  async deselectNodeByTreeIndex(treeIndex: number, applyToChildren = false): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    await treeIndices.forEach(idx => this.selectedNodes.delete(idx));
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
   * Set override transform of the node by tree index.
   * @param treeIndex
   * @param transform
   * @param applyToChildren
   */
  async setNodeTransformByTreeIndex(treeIndex: number, transform: THREE.Matrix4, applyToChildren = true) {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    treeIndices.forEach(idx => this.nodeTransforms.set(idx, transform));
    this.cadNode.requestNodeUpdate(treeIndices);
  }

  /**
   * Remove override transform of the node by tree index.
   * @param treeIndex
   * @param applyToChildren
   */
  async resetNodeTransformByTreeIndex(treeIndex: number, applyToChildren = true) {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);

    treeIndices.forEach(idx => this.nodeTransforms.delete(idx));
    this.cadNode.requestNodeUpdate(treeIndices);
  }

  /**
   * Enables ghost mode for the tree index given, making the object appear transparant and gray.
   * Note that ghosted objects are ignored in ray picking actions.
   * @param treeIndex       Tree index of node to ghost.
   * @param applyToChildren When true, all descendants of the node is also ghosted.
   * @returns Promise that resolves to the number of affected nodes.
   */
  async ghostNodeByTreeIndex(treeIndex: number, applyToChildren = false): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    treeIndices.forEach(idx => this.ghostedNodes.add(idx));
    this.cadNode.requestNodeUpdate(treeIndices.toArray());
    return treeIndices.count;
  }

  /**
   * Disables ghost mode for the tree index given, making the object be rendered normal.
   * @param treeIndex       Tree index of node to un-ghost.
   * @param applyToChildren When true, all descendants of the node is also un-ghosted.
   * @returns Promise that resolves to the number of affected nodes.
   */
  async unghostNodeByTreeIndex(treeIndex: number, applyToChildren = false): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    treeIndices.forEach(idx => this.ghostedNodes.delete(idx));
    const allIndices = Array.from(new Array(this.cadModel.scene.maxTreeIndex + 1).keys());
    this.cadNode.requestNodeUpdate(allIndices);
    return treeIndices.count;
  }

  /**
   * Enable ghost mode for all nodes in the model, making the whole model be rendered transparent
   * and in gray.
   */
  ghostAllNodes(): void {
    for (let i = 0; i <= this.cadModel.scene.maxTreeIndex; i++) {
      this.ghostedNodes.add(i);
    }
    this.cadNode.requestNodeUpdate(Array.from(this.ghostedNodes.values()));
  }

  /**
   * Disable ghost mode for all nodes in the model.
   */
  unghostAllNodes(): void {
    const ghostedNodes = Array.from(this.ghostedNodes);
    this.ghostedNodes.clear();
    this.cadNode.requestNodeUpdate(ghostedNodes);
  }

  /**
   * Show the node by node ID, that was hidden by {@link Cognite3DModel.hideNodeByTreeIndex},
   * {@link Cognite3DModel.hideNode} or {@link Cognite3DModel.hideAllNodes}
   * This method is async because nodeId might be not loaded yet.
   * @deprecated Use {@link Cognite3DModel.showNodeByTreeIndex}.
   * @param nodeId
   * @example
   * ```js
   * model.hideAllNodes();
   * model.showNode(nodeId);
   * ```
   */
  async showNode(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    await this.showNodeByTreeIndex(treeIndex);
  }

  /**
   * Show the node by tree index, that was hidden by {@link Cognite3DModel.hideNodeByTreeIndex},
   * {@link Cognite3DModel.hideNode} or {@link Cognite3DModel.hideAllNodes}.
   * @param treeIndex
   * @param applyToChildren
   */
  async showNodeByTreeIndex(treeIndex: number, applyToChildren = false): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    await treeIndices.forEach(idx => this.hiddenNodes.delete(idx));
    this.cadNode.requestNodeUpdate(treeIndices.toArray());
    return treeIndices.count;
  }

  /**
   * Show all the nodes that were hidden by {@link Cognite3DModel.hideNodeByTreeIndex},
   * {@link Cognite3DModel.hideNode} or {@link Cognite3DModel.hideAllNodes}.
   */
  showAllNodes(): void {
    const wasHidden = Array.from(this.hiddenNodes.values());
    this.hiddenNodes.clear();
    this.cadNode.requestNodeUpdate(wasHidden);
  }

  /**
   * Hides all nodes in the model.
   * @param makeGray Not supported.
   * @throws NotSupportedInMigrationWrapperError if `makeGray` is passed.
   */
  hideAllNodes(makeGray?: boolean): void {
    if (makeGray) {
      throw new NotSupportedInMigrationWrapperError('makeGray is not supported');
    }
    for (let i = 0; i <= this.cadModel.scene.maxTreeIndex; i++) {
      this.hiddenNodes.add(i);
    }
    this.cadNode.requestNodeUpdate(Array.from(this.hiddenNodes.values()));
  }

  /**
   * Hide the node by node ID.
   * This method is async because nodeId might be not loaded yet.
   * @deprecated Use {@link Cognite3DModel.hideNodeByTreeIndex}.
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
   * @param applyToChildren
   * @throws NotSupportedInMigrationWrapperError if `makeGray` is passed.
   */
  async hideNodeByTreeIndex(treeIndex: number, makeGray?: boolean, applyToChildren = false): Promise<number> {
    if (makeGray) {
      throw new NotSupportedInMigrationWrapperError('makeGray is not supported');
    }
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    await treeIndices.forEach(idx => this.hiddenNodes.add(idx));
    this.cadNode.requestNodeUpdate(treeIndices);
    return treeIndices.count;
  }

  /**
   * Maps a list of Node IDs to tree indices. This function is useful when you have
   * a list of nodes, e.g. from Asset Mappings, that you want to highlight, hide,
   * color etc in the viewer.
   *
   * @param nodeIds List of node IDs to map to tree indices.
   * @returns A list of tree indices corresponing to the elements in the input.
   * @throws If an invalid/non-existant node ID is provided the function throws an error.
   */
  async mapNodeIdsToTreeIndices(nodeIds: CogniteInternalId[]): Promise<number[]> {
    return this.nodeIdAndTreeIndexMaps.getTreeIndices(nodeIds);
  }

  /**
   * Maps a single node ID to tree index. This is useful when you e.g. have a
   * node ID from an asset mapping and want to highlight the given asset using
   * {@link selectNodeByTreeIndex}. If you have multiple node IDs to map,
   * {@link mapNodeIdsToTreeIndices} is recommended for better performance.
   *
   * @param nodeId A Node ID to map to a tree index.
   * @returns TreeIndex of the provided node.
   * @throws If an invalid/non-existant node ID is provided the function throws an error.
   */
  async mapNodeIdToTreeIndex(nodeId: CogniteInternalId): Promise<number> {
    return this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
  }

  /**
   * Maps a list of tree indices to node IDs for use with the Cognite SDK.
   * This function is useful if you have a list of tree indices, e.g. from
   * {@link Cognite3DModel.iterateSubtreeByTreeIndex}, and want to perform
   * some operations on these nodes using the SDK.
   *
   * @param treeIndices Tree indices to map to node IDs.
   * @returns A list of node IDs corresponding to the elements of the inpu.
   * @throws If an invalid tree index is provided the function throws an error.
   */
  async mapTreeIndicesToNodeIds(treeIndices: number[]): Promise<CogniteInternalId[]> {
    return this.nodeIdAndTreeIndexMaps.getNodeIds(treeIndices);
  }

  /**
   * Maps a single tree index to node ID for use with the API. If you have multiple
   * tree indices to map, {@link mapNodeIdsToTreeIndices} is recommended for better
   * performance.
   * @param treeIndex A tree index to map to a Node ID.
   * @returns TreeIndex of the provided node.
   * @throws If an invalid/non-existant node ID is provided the function throws an error.
   */
  async mapTreeIndexToNodeId(treeIndex: number): Promise<CogniteInternalId> {
    return this.nodeIdAndTreeIndexMaps.getNodeId(treeIndex);
  }

  /** @private */
  private async determineTreeIndices(treeIndex: number, includeDescendants: boolean): Promise<NumericRange> {
    let subtreeSize = 1;
    if (includeDescendants) {
      const subtreeSizePromise = await this.nodeIdAndTreeIndexMaps.getSubtreeSize(treeIndex);
      subtreeSize = subtreeSizePromise ? subtreeSizePromise : 1;
    }
    return new NumericRange(treeIndex, subtreeSize);
  }
}
