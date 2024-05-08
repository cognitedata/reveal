/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { CogniteInternalId } from '@cognite/sdk';
import sortBy from 'lodash/sortBy';

import { callActionWithIndicesAsync } from '../utilities/callActionWithIndicesAsync';

import { SupportedModelTypes } from '@reveal/model-base';
import { NodesApiClient } from '@reveal/nodes-api';
import { CadModelMetadata, getDistanceToMeterConversionFactor } from '@reveal/cad-parsers';
import { NumericRange, CameraConfiguration } from '@reveal/utilities';
import { MetricsLogger } from '@reveal/metrics';
import { NodeTransformProvider } from '@reveal/rendering';
import { NodeAppearance, NodeCollection, CdfModelNodeCollectionDataProvider } from '@reveal/cad-styling';
import { NodeIdAndTreeIndexMaps } from '../utilities/NodeIdAndTreeIndexMaps';
import { CadNode } from './CadNode';
import { WellKnownUnit } from '../types';
import { CustomSectorBounds } from '../utilities/CustomSectorBounds';

/**
 * Represents a single 3D CAD model loaded from CDF.
 * @noInheritDoc
 * @module @cognite/reveal
 */
export class CogniteCadModel implements CdfModelNodeCollectionDataProvider {
  public readonly type: SupportedModelTypes = 'cad';

  /**
   * @internal
   */
  private get nodeTransformProvider(): NodeTransformProvider {
    return this.cadNode.nodeTransformProvider;
  }

  /**
   * Returns the unit the coordinates for the model is stored. Returns an empty string
   * if no unit has been stored.
   * Note that coordinates in Reveal always are converted to meters using {@link CogniteCadModel.modelUnitToMetersFactor}.
   */
  get modelUnit(): WellKnownUnit | '' {
    // Note! Returns union type, because we expect it to be a value in WellKnownUnit, but we
    // can't guarantee it.
    return this.cadNode.cadModelMetadata.scene.unit as WellKnownUnit | '';
  }

  /**
   * Returns the conversion factor that converts from model coordinates to meters. Note that this can
   * return undefined if the model has been stored in an unsupported unit.
   */
  get modelUnitToMetersFactor(): number | undefined {
    return getDistanceToMeterConversionFactor(this.modelUnit);
  }

  /**
   * Sets the model visibility.
   * @example
   * ```js
   * model.visible = false
   * ```
   */
  set visible(value: boolean) {
    this.cadNode.visible = value;
  }

  /**
   * Returns the model visibility.
   */
  get visible(): boolean {
    return this.cadNode.visible;
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
  private readonly nodesApiClient: NodesApiClient;
  private readonly nodeIdAndTreeIndexMaps: NodeIdAndTreeIndexMaps;
  private _styledNodeCollections: {
    nodeCollection: NodeCollection;
    appearance: NodeAppearance;
    importance: number;
  }[] = [];
  private readonly customSectorBounds: CustomSectorBounds;

  /**
   * @param modelId
   * @param revisionId
   * @param cadNode
   * @param client
   * @internal
   */
  constructor(modelId: number, revisionId: number, cadNode: CadNode, client: NodesApiClient) {
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.cadModel = cadNode.cadModelMetadata;
    this.nodesApiClient = client;
    this.nodeIdAndTreeIndexMaps = new NodeIdAndTreeIndexMaps(modelId, revisionId, this.nodesApiClient);

    this.cadNode = cadNode;
    this.customSectorBounds = new CustomSectorBounds(this.cadNode);
    this.cadNode.treeIndexToSectorsMap.onChange = (treeIndex: number, newSectorId: number) => {
      if (this.customSectorBounds.isRegistered(treeIndex)) {
        this.customSectorBounds.updateNodeSectors(treeIndex, [newSectorId]);
      }
    };
    const cdfToWorldTransform = this.getModelTransformation()
      .clone()
      .multiply(this.getCdfToDefaultModelTransformation());
    this.nodeTransformProvider.setCdfToWorldTransform(cdfToWorldTransform);
  }

  /**
   * Sets the default appearance for nodes that are not styled using
   * {@link CogniteCadModel.assignStyledNodeCollection}. Updating the default style can be an
   * expensive operation, so use with care.
   *
   * @param appearance  Default node appearance.
   */
  setDefaultNodeAppearance(appearance: NodeAppearance): void {
    this.cadNode.defaultNodeAppearance = appearance;
  }

  /**
   * Gets the default appearance for nodes that are not styled using
   * {@link CogniteCadModel.assignStyledNodeCollection}.
   */
  getDefaultNodeAppearance(): NodeAppearance {
    return this.cadNode.defaultNodeAppearance;
  }

  /**
   * Returns all currently registered node collections and associated appearance.
   */
  get styledNodeCollections(): { nodeCollection: NodeCollection; appearance: NodeAppearance }[] {
    return [...this._styledNodeCollections];
  }

  /**
   * Customizes rendering style for a set of nodes, e.g. to highlight, hide
   * or color code a set of 3D objects. This allows for custom look and feel
   * of the 3D model which is useful to highlight certain parts or to
   * color code the 3D model based on information (e.g. coloring the 3D model
   * by construction status).
   *
   * The {@link NodeCollection} can be updated dynamically and the rendered nodes will be
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
   * @param importance The importance of this style. Can be used to manually order the order of styles, this can avoid the order of adding styles affecting the outcome. Optional and defaults to 0.
   * @example
   * ```js
   * model.setDefaultNodeAppearance({ rendererGhosted: true });
   * const visibleNodes = new TreeIndexNodeCollection(someTreeIndices);
   * model.assignStyledNodeCollection(visibleSet, { rendererGhosted: false });
   * ```
   */
  assignStyledNodeCollection(nodeCollection: NodeCollection, appearance: NodeAppearance, importance: number = 0): void {
    MetricsLogger.trackCadModelStyled(nodeCollection.classToken, appearance);

    const index = this._styledNodeCollections.findIndex(x => x.nodeCollection === nodeCollection);
    if (index !== -1) {
      this._styledNodeCollections[index].appearance = appearance;
    } else {
      this._styledNodeCollections.push({ nodeCollection: nodeCollection, appearance, importance });
    }
    this._styledNodeCollections = sortBy(this._styledNodeCollections, sc => sc.importance); // Using lodash sortBy as array.sort is not stable
    this.cadNode.nodeAppearanceProvider.assignStyledNodeCollection(nodeCollection, appearance, importance);
  }

  /**
   * Removes styling for previously added styled collection, resetting the style to the default (or
   * the style imposed by other styled collections).
   * @param nodeCollection   Node collection previously added using {@link CogniteCadModel.assignStyledNodeCollection}.
   * @throws Error if node collection isn't assigned to the model.
   */
  unassignStyledNodeCollection(nodeCollection: NodeCollection): void {
    const index = this._styledNodeCollections.findIndex(x => x.nodeCollection === nodeCollection);
    if (index === -1) {
      throw new Error('Node collection has not been assigned to model');
    }

    this._styledNodeCollections.splice(index, 1);
    this.cadNode.nodeAppearanceProvider.unassignStyledNodeCollection(nodeCollection);
  }

  /**
   * Removes all styled collections, resetting the appearance of all nodes to the
   * default appearance.
   */
  removeAllStyledNodeCollections(): void {
    this._styledNodeCollections.splice(0);
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
   * @param boundingBox       Optional bounding box for the nodes before any transformation is applied. If given, it is assumed that all the nodes' geometry fit inside.
   * @param space             Space to apply the transformation in. Defaults to 'world'.
   */
  setNodeTransform(
    treeIndices: NumericRange,
    transformMatrix: THREE.Matrix4,
    boundingBox?: THREE.Box3,
    space: 'model' | 'world' = 'world'
  ): void {
    MetricsLogger.trackCadNodeTransformOverridden(treeIndices.count, transformMatrix);

    this.nodeTransformProvider.setNodeTransform(treeIndices, transformMatrix, space);

    // Metadata bounding boxes are in CDF space. Precompute the necessary transformations once.
    const cdfToWorldTransform = this.getModelTransformation()
      .clone()
      .multiply(this.getCdfToDefaultModelTransformation());
    const modelToCdfTransform = cdfToWorldTransform.clone().invert();

    // Convert the transform to CDF space
    const transformMatrixCdf = modelToCdfTransform.clone().multiply(transformMatrix).multiply(cdfToWorldTransform);

    // Transform bounding box to CDF space, if given
    let nodeBoundingBox: THREE.Box3 | undefined;
    if (boundingBox) {
      nodeBoundingBox = boundingBox.clone();
      nodeBoundingBox.applyMatrix4(modelToCdfTransform);
    }

    // Update sector bounds
    for (const treeIndex of treeIndices.toArray()) {
      if (!this.customSectorBounds.isRegistered(treeIndex)) {
        // Register node as transformed
        this.customSectorBounds.registerTransformedNode(treeIndex, nodeBoundingBox);

        // Get the sectors that this node is currently known to have geometry in. As the mapping from tree index to sectors is built
        // when sectors are loaded, this node may have geometry in more sectors than what is currently known. If new sectors with geometry
        // from this node are discovered at a later point, customSectorBounds.updateNodeSectors will be called through the
        // treeIndexToSectorsMap.onChange callback, which is setup in the constructor.
        const sectorIds = this.cadNode.treeIndexToSectorsMap.getSectorIdsForTreeIndex(treeIndex);
        if (sectorIds.length) {
          this.customSectorBounds.updateNodeSectors(treeIndex, sectorIds);
        }
      }

      this.customSectorBounds.updateNodeTransform(treeIndex, transformMatrixCdf);
    }
    this.customSectorBounds.recomputeSectorBounds();
  }

  /**
   * Set override transform of the node by tree index.
   * @param treeIndex
   * @param transform
   * @param applyToChildren
   * @param space
   */
  async setNodeTransformByTreeIndex(
    treeIndex: number,
    transform: THREE.Matrix4,
    applyToChildren = true,
    space: 'model' | 'world' = 'world'
  ): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    const boundingBox = await this.getBoundingBoxByTreeIndex(treeIndex);
    this.setNodeTransform(treeIndices, transform, boundingBox, space);
    return treeIndices.count;
  }

  /**
   * Resets the transformation for the nodes given.
   * @param treeIndices Tree indices of the nodes to reset transforms for.
   */
  resetNodeTransform(treeIndices: NumericRange): void {
    this.nodeTransformProvider.resetNodeTransform(treeIndices);

    // Update sector bounds
    treeIndices.forEach(treeIndex => this.customSectorBounds.unregisterTransformedNode(treeIndex));
    this.customSectorBounds.recomputeSectorBounds();
  }

  /**
   * Remove override transform of the node by tree index.
   * @param treeIndex
   * @param applyToChildren
   */
  async resetNodeTransformByTreeIndex(treeIndex: number, applyToChildren = true): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    this.resetNodeTransform(treeIndices);
    return treeIndices.count;
  }

  /**
   * Cleans up used resources.
   */
  dispose(): void {
    this.cadNode.dispose();
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
    const nodeId = await this.mapTreeIndexToNodeId(treeIndex);
    const subtree = await this.nodesApiClient.determineNodeAncestorsByNodeId(
      this.modelId,
      this.revisionId,
      nodeId,
      generation
    );

    return new NumericRange(subtree.treeIndex, subtree.subtreeSize);
  }

  /**
   * Determines the full bounding box of the model.
   * @param outBoundingBox Optional. Used to write result to.
   * @param restrictToMostGeometry Optional. When true, returned bounds are restricted to
   * where most of the geometry is located. This is useful for models that have junk geometry
   * located far from the "main" model. Added in version 1.3.0.
   * @returns Model bounding box.
   *
   * @example
   * ```js
   * const boundingBox = new THREE.Box3()
   * model.getModelBoundingBox(boundingBox);
   * // boundingBox now has the bounding box
   * ```
   * ```js
   * // the following code does the same
   * const boundingBox = model.getModelBoundingBox();
   * ```
   */
  getModelBoundingBox(outBoundingBox?: THREE.Box3, restrictToMostGeometry?: boolean): THREE.Box3 {
    const bounds = restrictToMostGeometry
      ? this.cadModel.scene.getBoundsOfMostGeometry()
      : this.cadModel.scene.root.subtreeBoundingBox;

    outBoundingBox = outBoundingBox || new THREE.Box3();
    outBoundingBox.copy(bounds);
    outBoundingBox.applyMatrix4(this.cadModel.modelMatrix);
    return outBoundingBox;
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
    const cdfToWorldTransform = matrix.clone().multiply(this.getCdfToDefaultModelTransformation());
    this.nodeTransformProvider.setCdfToWorldTransform(cdfToWorldTransform);
  }

  /**
   * Gets transformation matrix that has previously been set with {@link CogniteCadModel.setModelTransformation}.
   * @param out Preallocated `THREE.Matrix4` (optional).
   */
  getModelTransformation(out?: THREE.Matrix4): THREE.Matrix4 {
    return this.cadNode.getModelTransformation(out);
  }

  /**
   * Sets the clipping planes for this model. They will be combined with the
   * global clipping planes.
   */
  setModelClippingPlanes(clippingPlanes: THREE.Plane[]): void {
    this.cadNode.clippingPlanes = clippingPlanes;
  }

  /**
   * Get the clipping planes for this model.
   */
  getModelClippingPlanes(): THREE.Plane[] {
    return [...this.cadNode.clippingPlanes];
  }

  /**
   * Gets transformation from CDF space to ThreeJS space,
   * which includes any additional "default" transformations assigned to this model.
   * Does not include any custom transformations set by {@link CogniteCadModel.setModelTransformation}
   * @param out Preallocated `THREE.Matrix4` (optional)
   */
  getCdfToDefaultModelTransformation(out?: THREE.Matrix4): THREE.Matrix4 {
    return this.cadNode.getCdfToDefaultModelTransformation(out);
  }

  /**
   * Map point from CDF to model space, taking the model's custom transformation into account
   * @param point Point to compute transformation from
   * @param out Optional pre-allocated point
   */
  mapPointFromCdfToModelCoordinates(point: THREE.Vector3, out: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 {
    const cdfToModelTransformation = this.getModelTransformation().multiply(this.getCdfToDefaultModelTransformation());
    return out.copy(point).applyMatrix4(cdfToModelTransformation);
  }

  /**
   * Map bounding box from CDF to model space, taking the model's custom transformation into account
   * @param box Box to compute transformation from
   * @param out Optional pre-allocated box
   */
  mapBoxFromCdfToModelCoordinates(box: THREE.Box3, out: THREE.Box3 = new THREE.Box3()): THREE.Box3 {
    const cdfToModelTransformation = this.getModelTransformation().multiply(this.getCdfToDefaultModelTransformation());
    return out.copy(box).applyMatrix4(cdfToModelTransformation);
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
    const boxList = await this.getBoundingBoxesByNodeIds([nodeId]);
    const outBox = box ?? new THREE.Box3();
    outBox.copy(boxList[0]);
    return outBox;
  }

  /**
   * Fetches a bounding box from the CDF by a list of nodeIds.
   * @param nodeIds
   * @example
   * ```js
   * const box = await model.getBoundingBoxByNodeIds([158239, 192837]);
   * ```
   */
  async getBoundingBoxesByNodeIds(nodeIds: number[]): Promise<THREE.Box3[]> {
    try {
      const boxesResponse = await this.nodesApiClient.getBoundingBoxesByNodeIds(this.modelId, this.revisionId, nodeIds);
      const boxesWorldSpace = boxesResponse.map(box => box.applyMatrix4(this.cadModel.modelMatrix));
      return boxesWorldSpace;
    } catch (error) {
      MetricsLogger.trackError(error as Error, {
        moduleName: 'CogniteCadModel',
        methodName: 'getBoundingBoxByNodeId'
      });
      throw error;
    }
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
   * {@link CogniteCadModel.mapNodeIdsToTreeIndices} is recommended for better performance when
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
   * {@link CogniteCadModel.iterateSubtreeByTreeIndex}, and want to perform
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
   * tree indices to map, {@link CogniteCadModel.mapNodeIdsToTreeIndices} is recommended for better
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
