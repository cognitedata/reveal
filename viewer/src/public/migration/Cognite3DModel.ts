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
import { SupportedModelTypes } from '@/datamodels/base';

const mapCoordinatesBuffers = {
  v: vec3.create()
};

export class Cognite3DModel extends THREE.Object3D implements CogniteModelBase {
  public readonly type: SupportedModelTypes = 'cad';

  get renderHints(): CadRenderHints {
    return this.cadNode.renderHints;
  }

  set renderHints(hints: CadRenderHints) {
    this.cadNode.renderHints = hints;
  }

  get loadingHints(): CadLoadingHints {
    return this.cadNode.loadingHints;
  }

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

  dispose() {
    this.children = [];
  }

  getSubtreeNodeIds(_nodeId: number, _subtreeSize?: number): Promise<number[]> {
    throw new NotSupportedInMigrationWrapperError('Use getSubtreeTreeIndices(treeIndex: number)');
  }

  async getSubtreeTreeIndices(treeIndex: number): Promise<number[]> {
    const treeIndices = await this.determineTreeIndices(treeIndex, true);
    return treeIndices.asArray();
  }

  getBoundingBox(nodeId?: number, box?: THREE.Box3): THREE.Box3 {
    if (nodeId) {
      throw new NotSupportedInMigrationWrapperError('Use getBoundingBoxFromCdf(nodeId: number)');
    }

    const bounds = this.cadModel.scene.root.bounds;
    return toThreeJsBox3(box || new THREE.Box3(), bounds, this.cadModel.modelTransformation);
  }

  getModelBoundingBox(outBbox?: THREE.Box3): THREE.Box3 {
    return this.getBoundingBox(undefined, outBbox);
  }

  updateTransformation(matrix: THREE.Matrix4): void {
    this.cadNode.applyMatrix4(matrix);
    this.cadNode.updateMatrixWorld(false);
  }

  /** @internal */
  updateNodeIdMaps(sector: Map<number, number>) {
    this.nodeIdAndTreeIndexMaps.updateMaps(sector);
  }

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

  iterateNodes(_action: (nodeId: number, treeIndex?: number) => void): void {
    throw new NotSupportedInMigrationWrapperError('Use iterateNodesByTreeIndex(action: (treeIndex: number) => void)');
  }
  iterateNodesByTreeIndex(action: (treeIndex: number) => void): void {
    for (let i = 0; i < this.cadModel.scene.maxTreeIndex; i++) {
      action(i);
    }
  }

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

  async resetNodeColor(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    await this.resetNodeColorByTreeIndex(treeIndex);
  }

  async resetNodeColorByTreeIndex(treeIndex: number, applyToChildren = false): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    treeIndices.forEach(idx => this.nodeColors.delete(idx));
    this.cadNode.requestNodeUpdate(treeIndices);
    return treeIndices.count;
  }

  resetAllNodeColors() {
    const treeIndices = [...this.nodeColors.keys()];
    this.nodeColors.clear();
    this.cadNode.requestNodeUpdate(treeIndices);
  }

  async selectNode(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.selectNodeByTreeIndex(treeIndex);
  }

  async selectNodeByTreeIndex(treeIndex: number, applyToChildren = false): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    treeIndices.forEach(idx => this.selectedNodes.add(idx));
    this.cadNode.requestNodeUpdate(treeIndices);
    return treeIndices.count;
  }

  async deselectNode(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    await this.deselectNodeByTreeIndex(treeIndex);
  }

  async deselectNodeByTreeIndex(treeIndex: number, applyToChildren = false): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    treeIndices.forEach(idx => this.selectedNodes.delete(idx));
    this.cadNode.requestNodeUpdate(treeIndices);
    return treeIndices.count;
  }

  deselectAllNodes(): void {
    const selectedNodes = Array.from(this.selectedNodes);
    this.selectedNodes.clear();
    this.cadNode.requestNodeUpdate(selectedNodes);
  }

  async showNode(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.showNodeByTreeIndex(treeIndex);
  }

  async showNodeByTreeIndex(treeIndex: number, applyToChildren = false): Promise<number> {
    const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
    this.hiddenNodes.delete(treeIndex);
    this.cadNode.requestNodeUpdate([treeIndex]);
    return treeIndices.count;
  }

  showAllNodes(): void {
    const wasHidden = Array.from(this.hiddenNodes.values());
    this.hiddenNodes.clear();
    this.cadNode.requestNodeUpdate(wasHidden);
  }

  hideAllNodes(makeGray?: boolean): void {
    if (makeGray) {
      throw new NotSupportedInMigrationWrapperError('makeGray is not supported');
    }
    for (let i = 0; i < this.cadModel.scene.maxTreeIndex; i++) {
      this.hiddenNodes.add(i);
    }
    this.cadNode.requestNodeUpdate(Array.from(this.hiddenNodes.values()));
  }

  async hideNode(nodeId: number, makeGray?: boolean): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    await this.hideNodeByTreeIndex(treeIndex, makeGray);
  }

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
