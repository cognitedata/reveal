/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { CogniteClient, CogniteInternalId } from '@cognite/sdk';

import { NodeIdAndTreeIndexMaps } from './NodeIdAndTreeIndexMaps';
import { CameraConfiguration } from './types';
import { CogniteModelBase } from './CogniteModelBase';

import { NumericRange } from '../../utilities';
import { CadNode } from '../../internals';
import { trackError } from '../../utilities/metrics';

import { SupportedModelTypes, CadModelMetadata } from '../types';
import { callActionWithIndicesAsync } from '../../utilities/callActionWithIndicesAsync';
import { CogniteClientNodeIdAndTreeIndexMapper } from '../../utilities/networking/CogniteClientNodeIdAndTreeIndexMapper';
import { NodeCollectionBase } from '../../datamodels/cad/styling';
import { NodeAppearance } from '../../datamodels/cad';
import { NodeTransformProvider } from '../../datamodels/cad/styling/NodeTransformProvider';
import assert from 'assert';

/**
 * Represents a single 3D CAD model loaded from CDF.
 * @noInheritDoc
 * @module @cognite/reveal
 */
export class Cognite3DModel extends THREE.Object3D implements CogniteModelBase {
  public readonly type: SupportedModelTypes = 'cad';

  /**
   * @internal
   */
  private get nodeTransformProvider(): NodeTransformProvider {
    return this.cadNode.nodeTransformProvider;
  }

  /** @internal */
  get styledNodeCollections(): { nodes: NodeCollectionBase; appearance: NodeAppearance }[] {
    return this._styledNodeCollections;
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
  private readonly client: CogniteClient;
  private readonly nodeIdAndTreeIndexMaps: NodeIdAndTreeIndexMaps;
  private readonly _styledNodeCollections: { nodes: NodeCollectionBase; appearance: NodeAppearance }[] = [];

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
    const indexMapper = new CogniteClientNodeIdAndTreeIndexMapper(client);
    this.nodeIdAndTreeIndexMaps = new NodeIdAndTreeIndexMaps(modelId, revisionId, client, indexMapper);

    this.cadNode = cadNode;

    this.add(this.cadNode);
  }

  /**
   * Sets the default appearance for nodes that are not styled using
   * {@link assignStyledNodeCollection}. Updating the default style can be an
   * expensive operation, so use with care.
   *
   * @param appearance  Default node appearance.
   */
  setDefaultNodeAppearance(appearance: NodeAppearance) {
    this.cadNode.defaultNodeAppearance = appearance;
  }

  /**
   * Gets the default appearance for nodes that are not styled using
   * {@link assignStyledNodeCollection}.
   */
  getDefaultNodeAppearance(): NodeAppearance {
    return this.cadNode.defaultNodeAppearance;
  }

  /**
   * Customizes rendering style for a set of nodes, e.g. to highlight, hide
   * or color code a set of 3D objects. This allows for custom look and feel
   * of the 3D model which is useful to highlight certain parts or to
   * color code the 3D model based on information (e.g. coloring the 3D model
   * by construction status).
   *
   * The {@link NodeCollectionBase} can be updated dynamically and the rendered nodes will be
   * updated automatically as the styling changes. The appearance of the style nodes
   * cannot be changed.
   *
   * When nodes are in several styled sets, the style is combined in the order
   * the sets were added, i.e. styled sets added late can overwrite styled sets added
   * early.
   *
   * If the `nodeCollection` provided already has an assigned style, this style will
   * be replaced with style provided.
   *
   * @param nodeCollection Dynamic set of nodes to apply the provided appearance to.
   * @param appearance Appearance to style the provided set with.
   * @example
   * ```js
   * model.setDefaultNodeAppearance({ rendererGhosted: true });
   * const visibleNodes = new TreeIndexNodeCollection(someTreeIndices);
   * model.assignStyledNodeCollection(visibleSet, { rendererGhosted: false });
   * ```
   */
  assignStyledNodeCollection(nodeCollection: NodeCollectionBase, appearance: NodeAppearance) {
    this._styledNodeCollections.push({ nodes: nodeCollection, appearance });
    this.cadNode.nodeAppearanceProvider.assignStyledNodeCollection(nodeCollection, appearance);
  }

  /**
   * Removes styling for previously added styled collection, resetting the style to the default (or
   * the style imposed by other styled collections).
   * @param nodeCollection   Node collection previously added using {@link assignStyledNodeCollection}.
   */
  unassignStyledNodeCollection(nodeCollection: NodeCollectionBase) {
    this.cadNode.nodeAppearanceProvider.unassignStyledNodeCollection(nodeCollection);
  }

  /**
   * Removes all styled collections, resetting the appearance of all nodes to the
   * default appearance.
   */
  removeAllStyledNodeCollections() {
    this.cadNode.nodeAppearanceProvider.clear();
  }

  /**
   * Apply a transformation matrix to the tree indices given, changing
   * rotation, scale and/or position.
   *
   * Note that setting multiple transformations for the same
   * node isn't supported and might lead to undefined results.
   * @param treeIndices       Tree indices of nodes to apply the transformation to.
   * @param transformMatrix   Transformation to apply.
   */
  setNodeTransform(treeIndices: NumericRange, transformMatrix: THREE.Matrix4) {
    this.nodeTransformProvider.setNodeTransform(treeIndices, transformMatrix);
  }

  /**
   * Resets the transformation for the nodes given.
   * @param treeIndices Tree indices of the nodes to reset transforms for.
   */
  resetNodeTransform(treeIndices: NumericRange) {
    this.nodeTransformProvider.resetNodeTransform(treeIndices);
  }

  /**
   * Maps a position retrieved from the CDF API (e.g. 3D node information) to
   * coordinates in "ThreeJS model space". This is necessary because CDF has a right-handed
   * Z-up coordinate system while ThreeJS uses a right-hand Y-up coordinate system.
   * @param p     The CDF coordinate to transform.
   * @param out   Optional preallocated buffer for storing the result. May be `p`.
   * @returns Transformed position.
   */
  mapFromCdfToModelCoordinates(p: THREE.Vector3, out?: THREE.Vector3): THREE.Vector3 {
    out = out !== undefined ? out : new THREE.Vector3();
    if (out !== p) {
      out.copy(p);
    }
    out.applyMatrix4(this.cadModel.modelMatrix);
    return out;
  }

  /**
   * Maps from a 3D position in "ThreeJS model space" (e.g. a ray intersection coordinate)
   * to coordinates in "CDF space". This is necessary because CDF has a right-handed
   * Z-up coordinate system while ThreeJS uses a right-hand Y-up coordinate system.
   * This function also accounts for transformation applied to the model.
   * @param p       The ThreeJS coordinate to transform.
   * @param out     Optional preallocated buffer for storing the result. May be `p`.
   * @returns Transformed position.
   */
  mapPositionFromModelToCdfCoordinates(p: THREE.Vector3, out?: THREE.Vector3): THREE.Vector3 {
    out = out !== undefined ? out : new THREE.Vector3();
    if (out !== p) {
      out.copy(p);
    }
    out.applyMatrix4(this.cadModel.inverseModelMatrix);
    return out;
  }

  /**
   * Maps from a 3D position in "ThreeJS model space" to coordinates in "CDF space".
   * This is necessary because CDF has a right-handed Z-up coordinate system while ThreeJS
   * uses a right-hand Y-up coordinate system. This function also accounts for transformation
   * applied to the model.
   * @param box     The box in ThreeJS/model coordinates.
   * @param out     Optional preallocated buffer for storing the result. May be `box`.
   * @returns       Transformed box.
   */
  mapBoxFromModelToCdfCoordinates(box: THREE.Box3, out?: THREE.Box3): THREE.Box3 {
    out = out ?? new THREE.Box3();
    if (out !== box) {
      out.copy(box);
    }
    out.applyMatrix4(this.cadModel.inverseModelMatrix);
    return out;
  }

  /**
   * Cleans up used resources.
   */
  dispose() {
    this.children = [];
  }

  /**
   * Determines the range of tree indices for a given subtree.
   * @param treeIndex Index of the root of the subtree to get the index range for.
   */
  async getSubtreeTreeIndices(treeIndex: number): Promise<NumericRange> {
    return this.determineTreeIndices(treeIndex, true);
  }

  /**
   * Determines the tree index range of a subtree of an ancestor of the provided
   * node defined by a tree index.
   *
   * @param treeIndex     Tree index of node to find ancestor tree index range for.
   * @param generation    What "generation" to find. 0 is the node itself,
   * 1 means parent, 2 means grandparent etc. If the node doesn't have as many
   * ancestors, the root of the model is returned. This can be determined by checking
   * that the range returned includes 0.
   * @returns Tree index range of the subtree spanned by the ancestor at the
   * "generation" specified, or the root.
   */
  async getAncestorTreeIndices(treeIndex: number, generation: number): Promise<NumericRange> {
    // This might fail if treeIndex is invalid, error checking below is just to be safe
    // and should not really happen.
    const nodeId = await this.mapTreeIndexToNodeId(treeIndex);

    const ancestors = await this.client.revisions3D.list3DNodeAncestors(this.modelId, this.revisionId, nodeId, {
      limit: 1000
    });
    const node = ancestors.items.find(x => x.treeIndex === treeIndex)!;
    assert(node !== undefined, `Could not find ancestor for node with treeIndex ${treeIndex}`);

    // Clamp to root if necessary
    generation = Math.min(node.depth, generation);
    const ancestor = ancestors.items.find(x => x.depth === node.depth - generation)!;
    assert(
      node !== undefined,
      `Could not find ancestor for node with treeIndex ${treeIndex} at 'generation' ${generation}`
    );

    return new NumericRange(ancestor.treeIndex, ancestor.subtreeSize);
  }

  /**
   * Determines the full bounding box of the model.
   * @param outBbox Optional. Used to write result to.
   * @param restrictToMostGeometry Optional. When true, returned bounds are restricted to
   * where most of the geometry is located. This is useful for models that have junk geometry
   * located far from the "main" model. Added in version 1.3.0.
   * @returns Model bounding box.
   *
   * @example
   * ```js
   * const box = new THREE.Box3()
   * model.getModelBoundingBox(box);
   * // box now has the bounding box
   * ```
   * ```js
   * // the following code does the same
   * const box = model.getModelBoundingBox();
   * ```
   */
  getModelBoundingBox(outBbox?: THREE.Box3, restrictToMostGeometry?: boolean): THREE.Box3 {
    const bounds = restrictToMostGeometry
      ? this.cadModel.scene.getBoundsOfMostGeometry()
      : this.cadModel.scene.root.bounds;

    outBbox = outBbox || new THREE.Box3();
    outBbox.copy(bounds);
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
    return callActionWithIndicesAsync(0, this.cadModel.scene.maxTreeIndex, action);
  }

  /**
   * Returns the number of nodes in the model.
   */
  get nodeCount(): number {
    return this.cadModel.scene.maxTreeIndex + 1;
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
   * Set override transform of the node by tree index.
   * @param treeIndex
   * @param transform
   * @param applyToChildren
   */
  async setNodeTransformByTreeIndex(
    treeIndex: number,
    transform: THREE.Matrix4,
    applyToChildren = true
  ): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    this.nodeTransformProvider.setNodeTransform(treeIndices, transform);
    return treeIndices.count;
  }

  /**
   * Remove override transform of the node by tree index.
   * @param treeIndex
   * @param applyToChildren
   */
  async resetNodeTransformByTreeIndex(treeIndex: number, applyToChildren = true): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    this.nodeTransformProvider.resetNodeTransform(treeIndices);
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
   * {@link mapNodeIdsToTreeIndices} is recommended for better performance when
   * mapping multiple IDs.
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
   * @returns A list of node IDs corresponding to the elements of the input.
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
   * @throws If an invalid/non-existent node ID is provided the function throws an error.
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
