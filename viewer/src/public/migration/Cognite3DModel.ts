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
import { CadRenderHints, CadNode } from '@/experimental';
import { CadLoadingHints } from '@/datamodels/cad/CadLoadingHints';
import { CadModelMetadata } from '@/datamodels/cad/CadModelMetadata';
import { NodeAppearanceProvider, DefaultNodeAppearance } from '@/datamodels/cad/NodeAppearance';
import { trackError } from '@/utilities/metrics';

const mapCoordinatesBuffers = {
  v: vec3.create()
};

export abstract class Cognite3DModel extends THREE.Object3D implements CogniteModelBase {
  public readonly type: SupportedModelTypes = SupportedModelTypes.CAD;

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

  protected readonly cadModel: CadModelMetadata;
  private readonly nodeColors: Map<number, [number, number, number, number]>;
  private readonly selectedNodes: Set<number>;
  private readonly hiddenNodes: Set<number>;

  /** @internal */
  constructor(modelId: number, revisionId: number, cadNode: CadNode) {
    super();
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.cadModel = cadNode.cadModelMetadata;
    this.nodeColors = new Map();
    this.hiddenNodes = new Set();
    this.selectedNodes = new Set();

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

    this.children.push(this.cadNode);
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

  abstract getBoundingBox(nodeId?: number, box?: THREE.Box3): THREE.Box3;
  abstract getBoundingBoxFromCdf(nodeId: number, box?: THREE.Box3): Promise<THREE.Box3>;
  abstract getNodeColor(nodeId: number): Promise<Color>;
  abstract setNodeColor(nodeId: number, r: number, g: number, b: number): Promise<void>;
  abstract resetNodeColor(nodeId: number): Promise<void>;
  abstract selectNode(nodeId: number): Promise<void>;
  abstract deselectNode(nodeId: number): Promise<void>;
  abstract showNode(nodeId: number): Promise<void>;
  abstract hideNode(nodeId: number, makeGray?: boolean): Promise<void>;
  abstract tryGetNodeId(treeIndex: number): number | undefined;
  /** @internal */
  abstract updateNodeIdMaps(sector: Map<number, number>): void;

  getSubtreeNodeIds(_nodeId: number, _subtreeSize?: number): Promise<number[]> {
    throw new NotSupportedInMigrationWrapperError();
  }

  getModelBoundingBox(outBbox?: THREE.Box3): THREE.Box3 {
    return this.getBoundingBox(undefined, outBbox);
  }

  updateTransformation(matrix: THREE.Matrix4): void {
    this.cadNode.applyMatrix4(matrix);
    this.cadNode.updateMatrixWorld(false);
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
    throw new NotSupportedInMigrationWrapperError();
  }

  getNodeOverrideColorByTreeIndex(treeIndex: number): Color | undefined {
    const c = this.nodeColors.get(treeIndex);
    return c ? { r: c[0], g: c[1], b: c[2] } : undefined;
  }

  setNodeColorByTreeIndex(treeIndex: number, r: number, g: number, b: number) {
    this.nodeColors.set(treeIndex, [r, g, b, 255]);
    this.cadNode.requestNodeUpdate([treeIndex]);
  }

  resetNodeColorByTreeIndex(treeIndex: number) {
    this.nodeColors.delete(treeIndex);
    this.cadNode.requestNodeUpdate([treeIndex]);
  }

  resetAllNodeColors() {
    const nodeIds = Array.from(this.nodeColors.keys());
    this.nodeColors.clear();
    this.cadNode.requestNodeUpdate(nodeIds);
  }

  selectNodeByTreeIndex(treeIndex: number) {
    this.selectedNodes.add(treeIndex);
    this.cadNode.requestNodeUpdate([treeIndex]);
  }

  deselectNodeByTreeIndex(treeIndex: number) {
    this.selectedNodes.delete(treeIndex);
    this.cadNode.requestNodeUpdate([treeIndex]);
  }

  deselectAllNodes(): void {
    const selectedNodes = Array.from(this.selectedNodes);
    this.selectedNodes.clear();
    this.cadNode.requestNodeUpdate(selectedNodes);
  }

  showNodeByTreeIndex(treeIndex: number): void {
    this.hiddenNodes.delete(treeIndex);
    this.cadNode.requestNodeUpdate([treeIndex]);
  }

  showAllNodes(): void {
    const wasHidden = Array.from(this.hiddenNodes.values());
    this.hiddenNodes.clear();
    this.cadNode.requestNodeUpdate(wasHidden);
  }

  hideAllNodes(makeGray?: boolean): void {
    if (makeGray) {
      throw new NotSupportedInMigrationWrapperError();
    }
    for (let i = 0; i < this.cadModel.scene.maxTreeIndex; i++) {
      this.hiddenNodes.add(i);
    }
    this.cadNode.requestNodeUpdate(Array.from(this.hiddenNodes.values()));
  }

  hideNodeByTreeIndex(treeIndex: number, makeGray?: boolean): void {
    if (makeGray) {
      throw new NotSupportedInMigrationWrapperError();
    }
    this.hiddenNodes.add(treeIndex);
    this.cadNode.requestNodeUpdate([treeIndex]);
  }
}

/** @internal */
export class CdfCognite3DModel extends Cognite3DModel {
  private readonly client: CogniteClient;
  private readonly nodeIdAndTreeIndexMaps: NodeIdAndTreeIndexMaps;

  constructor(modelId: number, revisionId: number, cadNode: CadNode, client: CogniteClient) {
    super(modelId, revisionId, cadNode);
    this.client = client;
    this.nodeIdAndTreeIndexMaps = new NodeIdAndTreeIndexMaps(modelId, revisionId, client);
  }

  getBoundingBox(nodeId?: number, box?: THREE.Box3): THREE.Box3 {
    if (nodeId) {
      throw new NotSupportedInMigrationWrapperError('Use getBoundingBoxFromCdf(nodeId: number)');
    }

    const bounds = this.cadModel.scene.root.bounds;
    return toThreeJsBox3(box || new THREE.Box3(), bounds, this.cadModel.modelTransformation);
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

  tryGetNodeId(treeIndex: number): number | undefined {
    return this.nodeIdAndTreeIndexMaps.getNodeId(treeIndex);
  }

  async hideNode(nodeId: number, makeGray?: boolean): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.hideNodeByTreeIndex(treeIndex, makeGray);
  }

  async showNode(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.showNodeByTreeIndex(treeIndex);
  }

  async selectNode(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.selectNodeByTreeIndex(treeIndex);
  }

  async deselectNode(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.deselectNodeByTreeIndex(treeIndex);
  }

  async getNodeColor(nodeId: number): Promise<Color> {
    try {
      const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
      const color = this.getNodeOverrideColorByTreeIndex(treeIndex);
      if (!color) {
        // TODO: migration wrapper currently does not support looking up colors not set by the user
        throw new NotSupportedInMigrationWrapperError('getNodeColor() only works for overridden colors');
      }
      return color;
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
    this.setNodeColorByTreeIndex(treeIndex, r, g, b);
  }

  async resetNodeColor(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.resetNodeColorByTreeIndex(treeIndex);
  }

  /** @internal */
  updateNodeIdMaps(sector: Map<number, number>) {
    this.nodeIdAndTreeIndexMaps.updateMaps(sector);
  }
}

/** @internal */
export class LocalCognite3DModel extends Cognite3DModel {
  constructor(modelId: number, revisionId: number, cadNode: CadNode) {
    super(modelId, revisionId, cadNode);
  }

  private notSupported(): Error {
    return new Error(`Not supported for local models`);
  }

  getBoundingBox(_nodeId?: number, _box?: THREE.Box3): THREE.Box3 {
    throw this.notSupported();
  }

  getBoundingBoxFromCdf(_nodeId: number, _box?: THREE.Box3): Promise<THREE.Box3> {
    throw this.notSupported();
  }

  tryGetNodeId(_treeIndex: number): number | undefined {
    throw this.notSupported();
  }

  hideNode(_nodeId: number, _makeGray?: boolean): Promise<void> {
    throw this.notSupported();
  }

  showNode(_nodeId: number): Promise<void> {
    throw this.notSupported();
  }

  selectNode(_nodeId: number): Promise<void> {
    throw this.notSupported();
  }

  deselectNode(_nodeId: number): Promise<void> {
    throw this.notSupported();
  }

  getNodeColor(_nodeId: number): Promise<Color> {
    throw this.notSupported();
  }

  setNodeColor(_nodeId: number, _r: number, _g: number, _b: number): Promise<void> {
    throw this.notSupported();
  }

  resetNodeColor(_nodeId: number): Promise<void> {
    throw this.notSupported();
  }

  /** @internal */
  updateNodeIdMaps(_sector: Map<number, number>) {}
}
