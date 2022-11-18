/**
 * Copyright 2021 Cognite AS
 */

import { NodeAppearanceProvider, NodeAppearance, PrioritizedArea } from '@reveal/cad-styling';
import { SectorScene, CadModelMetadata, RootSectorNode, WantedSector, ConsumedSector } from '@reveal/cad-parsers';
import { SectorRepository } from '@reveal/sector-loader';
import { ParsedGeometry } from '@reveal/sector-parser';
import { CadMaterialManager, NodeTransformProvider, RenderMode } from '@reveal/rendering';
import { GeometryBatchingManager } from '../batching/GeometryBatchingManager';

import { Group, Object3D, Plane, Matrix4 } from 'three';

export class CadNode extends Object3D {
  private readonly _cadModelMetadata: CadModelMetadata;
  private readonly _materialManager: CadMaterialManager;
  private readonly _sectorRepository: SectorRepository;

  // savokr 01-04-22: These are made non-readonly because they need to be manually deleted when model is removed.
  // Can be made back to readonly if all references of the CadNode are removed from memory when model is removed
  // from the scene. Also possible to make the same thing only inside GeometryBatchingManager and RootSectorNode.
  private _rootSector: RootSectorNode;
  private _sectorScene: SectorScene;
  private _geometryBatchingManager?: GeometryBatchingManager;

  private readonly _sourceTransform: Matrix4;
  private readonly _customTransform: Matrix4;

  constructor(model: CadModelMetadata, materialManager: CadMaterialManager, sectorRepository: SectorRepository) {
    super();
    this.type = 'CadNode';
    this.name = 'Sector model';
    this._materialManager = materialManager;
    this._sectorRepository = sectorRepository;

    const batchedGeometryMeshGroup = new Group();
    batchedGeometryMeshGroup.name = 'Batched Geometry';

    const materials = materialManager.getModelMaterials(model.modelIdentifier);
    this._geometryBatchingManager = new GeometryBatchingManager(batchedGeometryMeshGroup, materials);

    this._rootSector = new RootSectorNode(model);

    this._rootSector.add(batchedGeometryMeshGroup);

    this._cadModelMetadata = model;
    const { scene } = model;

    this._sectorScene = scene;

    // Prepare renderables
    this.add(this._rootSector);

    this.matrixAutoUpdate = false;
    this.updateMatrixWorld();

    this._sourceTransform = new Matrix4().copy(model.modelMatrix);
    this._customTransform = new Matrix4();
  }

  get nodeTransformProvider(): NodeTransformProvider {
    return this._materialManager.getModelNodeTransformProvider(this._cadModelMetadata.modelIdentifier);
  }

  get nodeAppearanceProvider(): NodeAppearanceProvider {
    return this._materialManager.getModelNodeAppearanceProvider(this._cadModelMetadata.modelIdentifier);
  }

  get defaultNodeAppearance(): NodeAppearance {
    return this._materialManager.getModelDefaultNodeAppearance(this._cadModelMetadata.modelIdentifier);
  }

  set defaultNodeAppearance(appearance: NodeAppearance) {
    this._materialManager.setModelDefaultNodeAppearance(this._cadModelMetadata.modelIdentifier, appearance);
  }

  get clippingPlanes(): Plane[] {
    return this._materialManager.clippingPlanes;
  }

  set clippingPlanes(planes: Plane[]) {
    this._materialManager.clippingPlanes = planes;
  }

  get cadModelMetadata(): CadModelMetadata {
    return this._cadModelMetadata;
  }

  get cadModelIdentifier(): string {
    return this._cadModelMetadata.modelIdentifier;
  }

  get sectorScene(): SectorScene {
    return this._sectorScene;
  }

  get rootSector(): RootSectorNode {
    return this._rootSector;
  }

  get materialManager(): CadMaterialManager {
    return this._materialManager;
  }

  set renderMode(mode: RenderMode) {
    this._materialManager.setRenderMode(mode);
  }

  get renderMode(): RenderMode {
    return this._materialManager.getRenderMode();
  }

  public loadSector(sector: WantedSector): Promise<ConsumedSector> {
    return this._sectorRepository.loadSector(sector);
  }

  /**
   * Sets transformation matrix of the model. This overrides the current transformation.
   * @param matrix Transformation matrix.
   */
  setModelTransformation(matrix: THREE.Matrix4): void {
    this._customTransform.copy(matrix);
    const customTransformFromSource = this._customTransform.clone().premultiply(this._sourceTransform);
    this._rootSector.setModelTransformation(customTransformFromSource);
    this._cadModelMetadata.modelMatrix.copy(customTransformFromSource);
  }

  /**
   * Gets transformation matrix of the model
   * @param out Preallocated `THREE.Matrix4` (optional).
   */
  getModelTransformation(out: Matrix4 = new Matrix4()): Matrix4 {
    return out.copy(this._customTransform);
  }

  get prioritizedAreas(): PrioritizedArea[] {
    return this.nodeAppearanceProvider.getPrioritizedAreas();
  }

  public batchGeometry(geometryBatchingQueue: ParsedGeometry[], sectorId: number): void {
    this._geometryBatchingManager?.batchGeometries(geometryBatchingQueue, sectorId);
  }

  public removeBatchedSectorGeometries(sectorId: number): void {
    this._geometryBatchingManager?.removeSectorBatches(sectorId);
  }

  public setCacheSize(sectorCount: number): void {
    this._sectorRepository.setCacheSize(sectorCount);
  }

  public dispose(): void {
    this._sectorRepository.clearCache();
    this._materialManager.removeModelMaterials(this._cadModelMetadata.modelIdentifier);
    this._geometryBatchingManager?.dispose();
    this._rootSector?.dereferenceAllNodes();
    this._rootSector?.clear();
    this.clear();

    delete this._geometryBatchingManager;
    // @ts-ignore
    delete this._rootSector;
    // @ts-ignore
    delete this._sectorScene;
  }
}
