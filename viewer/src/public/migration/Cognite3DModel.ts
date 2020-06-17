/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { CogniteClient } from '@cognite/sdk';

import { NodeIdAndTreeIndexMaps } from './NodeIdAndTreeIndexMaps';
import { Color, SupportedModelTypes } from './types';
import { CogniteModelBase } from './CogniteModelBase';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import { toThreeJsBox3, toThreeMatrix4, toThreeVector3, fromThreeVector3 } from '@/utilities';
import { CadRenderHints, CadNode, ModelNodeAppearance } from '@/experimental';
import { CadLoadingHints } from '@/datamodels/cad/CadLoadingHints';
import { CadModelMetadata } from '@/datamodels/cad/CadModelMetadata';
import { SectorGeometry } from '@/datamodels/cad/sector/types';
import { SectorQuads } from '@/datamodels/cad/rendering/types';
import { ModelRenderAppearance } from '@/datamodels/cad';
import { vec3 } from 'gl-matrix';

const mapCoordinatesBuffers = {
  v: vec3.create()
};

export class Cognite3DModel extends THREE.Object3D implements CogniteModelBase {
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
  readonly cadModel: CadModelMetadata;
  readonly cadNode: CadNode;
  readonly nodeColors: Map<number, [number, number, number, number]>;
  readonly selectedNodes: Set<number>;
  readonly hiddenNodes: Set<number>;
  readonly client: CogniteClient;
  readonly nodeIdAndTreeIndexMaps: NodeIdAndTreeIndexMaps;

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
    const nodeAppearance: ModelNodeAppearance = {
      color: (treeIndex: number) => {
        if (this.selectedNodes.has(treeIndex)) {
          return [100, 100, 255, 255];
        }
        return this.nodeColors.get(treeIndex);
      },
      visible: (treeIndex: number) => {
        return this.hiddenNodes.has(treeIndex) ? false : true;
      }
    };

    const renderAppearance: ModelRenderAppearance = {
      renderInFront: (treeIndex: number) => {
        return this.selectedNodes.has(treeIndex);
      }
    };

    cadNode.materialManager.updateLocalAppearance(this.cadModel.blobUrl, nodeAppearance);
    cadNode.materialManager.updateRenderAppearance(this.cadModel.blobUrl, renderAppearance);

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

  getSubtreeNodeIds(_nodeId: number, _subtreeSize?: number): Promise<number[]> {
    throw new NotSupportedInMigrationWrapperError();
  }

  getBoundingBox(nodeId?: number, box?: THREE.Box3): THREE.Box3 {
    if (nodeId) {
      throw new NotSupportedInMigrationWrapperError('Use getBoundingBoxFromCdf(nodeId: number)');
    }

    const bounds = this.cadModel.scene.root.bounds;
    return toThreeJsBox3(box || new THREE.Box3(), bounds, this.cadModel.modelTransformation);
  }

  getModelBoundingBox(): THREE.Box3 {
    return this.getBoundingBox();
  }

  updateNodeIdMaps(sector: { lod: string; data: SectorGeometry | SectorQuads }) {
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
    throw new NotSupportedInMigrationWrapperError();
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
      // tslint:disable-next-line: no-console
      console.error(`Cannot get color of ${nodeId} because of error:`, error);
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

  setNodeColorByTreeIndex(treeIndex: number, r: number, g: number, b: number) {
    this.nodeColors.set(treeIndex, [r, g, b, 255]);
    this.cadNode.requestNodeUpdate([treeIndex]);
  }

  async resetNodeColor(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.resetNodeColorByTreeIndex(treeIndex);
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

  async selectNode(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.selectNodeByTreeIndex(treeIndex);
  }

  selectNodeByTreeIndex(treeIndex: number) {
    this.selectedNodes.add(treeIndex);
    this.cadNode.requestNodeUpdate([treeIndex]);
  }

  async deselectNode(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.deselectNodeByTreeIndex(treeIndex);
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

  async showNode(nodeId: number): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.showNodeByTreeIndex(treeIndex);
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

  async hideNode(nodeId: number, makeGray?: boolean): Promise<void> {
    const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
    this.hideNodeByTreeIndex(treeIndex, makeGray);
  }

  hideNodeByTreeIndex(treeIndex: number, makeGray?: boolean): void {
    if (makeGray) {
      throw new NotSupportedInMigrationWrapperError();
    }
    this.hiddenNodes.add(treeIndex);
    this.cadNode.requestNodeUpdate([treeIndex]);
  }

  tryGetNodeId(treeIndex: number): number | undefined {
    return this.nodeIdAndTreeIndexMaps.getNodeId(treeIndex);
  }
}
