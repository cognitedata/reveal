/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { CogniteClient } from '@cognite/sdk';
import { vec3 } from 'gl-matrix';

import { NodeIdAndTreeIndexMaps } from './NodeIdAndTreeIndexMaps';
import { Color, SupportedModelTypes } from './types';
import { CogniteModelBase } from './CogniteModelBase';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import { toThreeJsBox3, toThreeMatrix4, toThreeVector3, fromThreeVector3 } from '@/utilities';
import { CadLoadingHints, CadNode, CadRenderHints } from '@/experimental';
import { CadModelMetadata } from '@/datamodels/cad/CadModelMetadata';
import { NodeAppearanceProvider, DefaultNodeAppearance } from '@/datamodels/cad/NodeAppearance';
import { trackError } from '@/utilities/metrics';

const mapCoordinatesBuffers = {
  v: vec3.create()
};

/**
 * Documentation for the Cognite3DModel class
 * @noInheritDoc
 */
export class Cognite3DModel extends THREE.Object3D implements CogniteModelBase {
  // overrides `THREE.Object3D` type property
  public readonly type: SupportedModelTypes = SupportedModelTypes.CAD;

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

  readonly modelId: number;
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
   * Used to clean up memory.
   */
  dispose() {
    this.children = [];
  }

  /**
   * @deprecated
   * @throws NotSupportedInMigrationWrapperError
   */
  getSubtreeNodeIds(_nodeId: number, _subtreeSize?: number): Promise<number[]> {
    throw new NotSupportedInMigrationWrapperError();
  }

  /**
   * @deprecated Use {@link Cognite3DModel.getModelBoundingBox}. It does the same thing.
   * @param nodeId Not supported anymore. See {@link Cognite3DModel.getBoundingBoxFromCdf}
   * @param box Optional. Used to write result to.
   * @throws NotSupportedInMigrationWrapperError if nodeId is passed
   * @returns model's bounding box.
   */
  getBoundingBox(nodeId?: number, box?: THREE.Box3): THREE.Box3 {
    if (nodeId) {
      throw new NotSupportedInMigrationWrapperError('Use getBoundingBoxFromCdf(nodeId: number)');
    }

    const bounds = this.cadModel.scene.root.bounds;
    return toThreeJsBox3(box || new THREE.Box3(), bounds, this.cadModel.modelTransformation);
  }

  /**
   * @param outBbox Optional. Used to write result to.
   * @returns model's bounding box.
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
    return this.getBoundingBox(undefined, outBbox);
  }

  /**
   * Apply transformation matrix to the model.
   * @param matrix Matrix to be applied.
   */
  updateTransformation(matrix: THREE.Matrix4): void {
    this.cadNode.applyMatrix4(matrix);
    this.cadNode.updateMatrixWorld(false);
  }

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
    throw new NotSupportedInMigrationWrapperError();
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
   * Set node color by nodeId.
   * This method is async because nodeId might be not loaded yet.
   * @see {@link Cognite3DModel.setNodeColorByTreeIndex}
   * @param nodeId
   * @param r
   * @param g
   * @param b
   */
  async setNodeColor(nodeId: number, r: number, g: number, b: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.setNodeColorByTreeIndex(treeIndex, r, g, b);
  }

  /**
   * Set node color by treeIndex.
   * @param treeIndex
   * @param r
   * @param g
   * @param b
   * @example
   * ```js
   * model.setNodeColorByTreeIndex(treeIndex, 255, 0, 0);
   * ```
   */
  setNodeColorByTreeIndex(treeIndex: number, r: number, g: number, b: number) {
    this.nodeColors.set(treeIndex, [r, g, b]);
    this.cadNode.requestNodeUpdate([treeIndex]);
  }

  /**
   * Set original node color by nodeId.
   * This method is async because nodeId might be not loaded yet.
   * @see {@link Cognite3DModel.resetNodeColorByTreeIndex}
   * @param nodeId
   */
  async resetNodeColor(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.resetNodeColorByTreeIndex(treeIndex);
  }

  /**
   * Set original node color by treeIndex.
   * @param treeIndex
   */
  resetNodeColorByTreeIndex(treeIndex: number) {
    this.nodeColors.delete(treeIndex);
    this.cadNode.requestNodeUpdate([treeIndex]);
  }

  /**
   * Restore original colors for all nodes of the model.
   */
  resetAllNodeColors() {
    const nodeIds = Array.from(this.nodeColors.keys());
    this.nodeColors.clear();
    this.cadNode.requestNodeUpdate(nodeIds);
  }

  /**
   * Highlight node by nodeId.
   * This method is async because nodeId might be not loaded yet.
   * @see {@link Cognite3DModel.selectNodeByTreeIndex}
   * @param nodeId
   */
  async selectNode(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.selectNodeByTreeIndex(treeIndex);
  }

  /**
   * Highlight node by treeIndex.
   * @param treeIndex
   */
  selectNodeByTreeIndex(treeIndex: number) {
    this.selectedNodes.add(treeIndex);
    this.cadNode.requestNodeUpdate([treeIndex]);
  }

  /**
   * Removes selection from the node by nodeId
   */
  async deselectNode(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.deselectNodeByTreeIndex(treeIndex);
  }

  /**
   * Removes selection from the node by treeIndex
   */
  deselectNodeByTreeIndex(treeIndex: number) {
    this.selectedNodes.delete(treeIndex);
    this.cadNode.requestNodeUpdate([treeIndex]);
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
   * Show the node by nodeId, that was hidden by {@link Cognite3DModel.hideNodeByTreeIndex},
   * {@link Cognite3DModel.hideNode} or {@link Cognite3DModel.hideAllNodes}
   * This method is async because nodeId might be not loaded yet.
   * @see {@link Cognite3DModel.showNodeByTreeIndex}
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
   * Show the node by treeIndex, that was hidden by {@link Cognite3DModel.hideNodeByTreeIndex},
   * {@link Cognite3DModel.hideNode} or {@link Cognite3DModel.hideAllNodes}
   * @param treeIndex
   */
  showNodeByTreeIndex(treeIndex: number): void {
    this.hiddenNodes.delete(treeIndex);
    this.cadNode.requestNodeUpdate([treeIndex]);
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
   * @param makeGray Not supported yet.
   * @throws NotSupportedInMigrationWrapperError if `makeGray` is passed
   */
  hideAllNodes(makeGray?: boolean): void {
    if (makeGray) {
      throw new NotSupportedInMigrationWrapperError();
    }
    for (let i = 0; i < this.cadModel.scene.maxTreeIndex; i++) {
      this.hiddenNodes.add(i);
    }
    this.cadNode.requestNodeUpdate(Array.from(this.hiddenNodes.values()));
  }

  /**
   * Hide the node by nodeId.
   * This method is async because nodeId might be not loaded yet.
   * @see {@link Cognite3DModel.hideNodeByTreeIndex}
   * @param nodeId
   * @param makeGray Not supported yet.
   */
  async hideNode(nodeId: number, makeGray?: boolean): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.hideNodeByTreeIndex(treeIndex, makeGray);
  }

  /**
   * Hide the node by treeIndex.
   * @param treeIndex
   * @param makeGray Not supported yet.
   * @throws NotSupportedInMigrationWrapperError if `makeGray` is passed
   */
  hideNodeByTreeIndex(treeIndex: number, makeGray?: boolean): void {
    if (makeGray) {
      throw new NotSupportedInMigrationWrapperError();
    }
    this.hiddenNodes.add(treeIndex);
    this.cadNode.requestNodeUpdate([treeIndex]);
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
}
