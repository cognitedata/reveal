/**
 * Copyright 2021 Cognite AS
 */

import { NodeAppearanceProvider, NodeAppearance, PrioritizedArea } from '@reveal/cad-styling';
import { SectorScene, CadModelMetadata, RootSectorNode, WantedSector, ConsumedSector } from '@reveal/cad-parsers';
import { SectorRepository } from '@reveal/sector-loader';
import { ParsedGeometry } from '@reveal/sector-parser';
import {
  CadMaterialManager,
  NodeTransformProvider,
  RenderMode,
  setModelRenderLayers,
  StyledTreeIndexSets
} from '@reveal/rendering';

import {
  Group,
  Object3D,
  Plane,
  Matrix4,
  Object3DEventMap,
  BufferGeometry,
  Mesh,
  RawShaderMaterial,
  Sphere,
  BufferAttribute,
  Box3
} from 'three';
import * as THREE from 'three';
import { DrawCallBatchingManager } from '../batching/DrawCallBatchingManager';
import { MultiBufferBatchingManager } from '../batching/MultiBufferBatchingManager';
import { TreeIndexToSectorsMap } from '../utilities/TreeIndexToSectorsMap';
import { AutoDisposeGroup, incrementOrInsertIndex } from '@reveal/utilities';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import { ParsedMeshGeometry } from '@reveal/cad-parsers';

export class CadNode extends Object3D<Object3DEventMap & { update: undefined }> {
  private readonly _cadModelMetadata: CadModelMetadata;
  private readonly _materialManager: CadMaterialManager;
  private readonly _sectorRepository: SectorRepository;

  // savokr 01-04-22: These are made non-readonly because they need to be manually deleted when model is removed.
  // Can be made back to readonly if all references of the CadNode are removed from memory when model is removed
  // from the scene. Also possible to make the same thing only inside GeometryBatchingManager and RootSectorNode.
  private _rootSector: RootSectorNode;
  private _sectorScene: SectorScene;
  private _geometryBatchingManager?: DrawCallBatchingManager;

  private readonly _sourceTransform: Matrix4;
  private readonly _customTransform: Matrix4;
  private readonly _setModelRenderLayers = () => this.setModelRenderLayers();
  private readonly _batchedGeometryMeshGroup: Group;
  private readonly _styledTreeIndexSets: StyledTreeIndexSets;

  private _isDisposed: boolean = false;

  private _needsRedraw: boolean = false;

  // Track mesh groups by sector ID for proper cleanup when sectors are unloaded
  private readonly _sectorMeshGroups: Map<number, AutoDisposeGroup> = new Map();

  public readonly treeIndexToSectorsMap;

  public readonly type = 'CadNode';

  constructor(model: CadModelMetadata, materialManager: CadMaterialManager, sectorRepository: SectorRepository) {
    super();
    this.name = 'Sector model';
    this._materialManager = materialManager;
    this._sectorRepository = sectorRepository;
    this.treeIndexToSectorsMap = new TreeIndexToSectorsMap(model.scene.maxTreeIndex);
    const back = this._materialManager.getModelBackTreeIndices(model.modelIdentifier.revealInternalId);
    const ghost = this._materialManager.getModelGhostedTreeIndices(model.modelIdentifier.revealInternalId);
    const inFront = this._materialManager.getModelInFrontTreeIndices(model.modelIdentifier.revealInternalId);
    const visible = this._materialManager.getModelVisibleTreeIndices(model.modelIdentifier.revealInternalId);

    this._styledTreeIndexSets = {
      back,
      ghost,
      inFront,
      visible
    };

    this._batchedGeometryMeshGroup = new Group();
    this._batchedGeometryMeshGroup.name = 'Batched Geometry';

    const materials = materialManager.getModelMaterials(model.modelIdentifier.revealInternalId);
    this._geometryBatchingManager = new MultiBufferBatchingManager(
      this._batchedGeometryMeshGroup,
      materials,
      this._styledTreeIndexSets,
      this.treeIndexToSectorsMap
    );
    this._rootSector = new RootSectorNode(model);

    this._rootSector.add(this._batchedGeometryMeshGroup);

    this._cadModelMetadata = model;
    const { scene } = model;

    this._sectorScene = scene;

    // Prepare renderables
    this.add(this._rootSector);

    this.matrixAutoUpdate = false;
    this.updateMatrixWorld();

    this._sourceTransform = new Matrix4().copy(model.modelMatrix);
    this._customTransform = new Matrix4();

    this.materialManager.on('materialsChanged', this._setModelRenderLayers);
  }

  get needsRedraw(): boolean {
    return this._needsRedraw;
  }

  resetRedraw(): void {
    this._needsRedraw = false;
  }

  get nodeTransformProvider(): NodeTransformProvider {
    return this._materialManager.getModelNodeTransformProvider(this._cadModelMetadata.modelIdentifier.revealInternalId);
  }

  get nodeAppearanceProvider(): NodeAppearanceProvider {
    return this._materialManager.getModelNodeAppearanceProvider(
      this._cadModelMetadata.modelIdentifier.revealInternalId
    );
  }

  get defaultNodeAppearance(): NodeAppearance {
    return this._materialManager.getModelDefaultNodeAppearance(this._cadModelMetadata.modelIdentifier.revealInternalId);
  }

  set defaultNodeAppearance(appearance: NodeAppearance) {
    this._materialManager.setModelDefaultNodeAppearance(
      this._cadModelMetadata.modelIdentifier.revealInternalId,
      appearance
    );
    this.setModelRenderLayers();
  }

  get clippingPlanes(): Plane[] {
    return this._materialManager.getModelClippingPlanes(this._cadModelMetadata.modelIdentifier.revealInternalId);
  }

  set clippingPlanes(planes: Plane[]) {
    this._materialManager.setModelClippingPlanes(this._cadModelMetadata.modelIdentifier.revealInternalId, planes);
  }

  get cadModelMetadata(): CadModelMetadata {
    return this._cadModelMetadata;
  }

  get cadModelIdentifier(): symbol {
    return this._cadModelMetadata.modelIdentifier.revealInternalId;
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

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  public loadSector(sector: WantedSector, abortSignal?: AbortSignal): Promise<ConsumedSector> {
    return this._sectorRepository.loadSector(sector, abortSignal);
  }

  /**
   * Sets transformation matrix of the model. This overrides the current transformation.
   * @param matrix Transformation matrix.
   */
  setModelTransformation(matrix: Matrix4): void {
    this._customTransform.copy(matrix);
    const customTransformFromSource = this._customTransform.clone().multiply(this._sourceTransform);
    this._rootSector.setModelTransformation(customTransformFromSource);
    this._cadModelMetadata.modelMatrix.copy(customTransformFromSource);

    this._needsRedraw = true;
  }

  /**
   * Gets transformation matrix of the model
   * @param out Preallocated `THREE.Matrix4` (optional).
   */
  getModelTransformation(out: Matrix4 = new Matrix4()): Matrix4 {
    return out.copy(this._customTransform);
  }

  getCdfToDefaultModelTransformation(out: Matrix4 = new Matrix4()): Matrix4 {
    return out.copy(this._sourceTransform);
  }

  public setModelRenderLayers(root: Object3D = this): void {
    setModelRenderLayers(root, this._styledTreeIndexSets);
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

  public removeSectorMeshGroup(sectorId: number): void {
    const meshGroup = this._sectorMeshGroups.get(sectorId);
    if (meshGroup) {
      // Remove from parent if it's still attached
      if (meshGroup.parent) {
        meshGroup.parent.remove(meshGroup);
      }

      // Manually dispose all resources in the group (geometries, materials, textures)
      for (const child of meshGroup.children) {
        if (child instanceof THREE.Mesh && child.geometry !== undefined) {
          child.geometry.dispose();
        }
      }

      // Dispose textures
      meshGroup.textures.forEach(texture => texture.dispose());

      // Clear the group
      meshGroup.clear();

      // Remove from our tracking map
      this._sectorMeshGroups.delete(sectorId);
    }
  }

  public createMeshesFromParsedGeometries(
    parsedMeshGeometries: ParsedMeshGeometry[],
    sectorId: number
  ): AutoDisposeGroup {
    // Remove any existing mesh group for this sector first
    this.removeSectorMeshGroup(sectorId);

    const group = new AutoDisposeGroup();
    const materials = this._materialManager.getModelMaterials(this._cadModelMetadata.modelIdentifier.revealInternalId);

    parsedMeshGeometries.forEach(geometryData => {
      if (geometryData.type === RevealGeometryCollectionType.TriangleMesh) {
        // Create basic triangle mesh
        this.createMeshFromGeometry(
          group,
          geometryData.geometryBuffer,
          materials.triangleMesh,
          geometryData.wholeSectorBoundingBox
        );
      } else if (geometryData.type === RevealGeometryCollectionType.TexturedTriangleMesh && geometryData.texture) {
        // Create textured triangle mesh with model-specific material
        const texturedMaterial = this._materialManager.addTexturedMeshMaterial(
          this._cadModelMetadata.modelIdentifier.revealInternalId,
          sectorId,
          geometryData.texture
        );

        this.createMeshFromGeometry(
          group,
          geometryData.geometryBuffer,
          texturedMaterial,
          geometryData.wholeSectorBoundingBox
        );

        // Add texture to group for proper disposal
        group.addTexture(geometryData.texture);
      }
    });

    // Track this mesh group by sector ID for cleanup when sector is unloaded
    this._sectorMeshGroups.set(sectorId, group);

    return group;
  }

  private createMeshFromGeometry(
    group: AutoDisposeGroup,
    geometry: BufferGeometry,
    material: RawShaderMaterial,
    geometryBoundingBox: Box3
  ): void {
    // Assigns an approximate bounding-sphere to the geometry to avoid recalculating this on first render
    geometry.boundingSphere = geometryBoundingBox.getBoundingSphere(new Sphere());

    const mesh = new Mesh(geometry, material);
    group.add(mesh);
    mesh.frustumCulled = false; // Note: Frustum culling does not play well with node-transforms

    mesh.userData.treeIndices = this.createTreeIndexSet(geometry);

    if (material.uniforms.inverseModelMatrix === undefined) return;

    mesh.onBeforeRender = () => {
      const inverseModelMatrix: Matrix4 = material.uniforms.inverseModelMatrix.value;
      inverseModelMatrix.copy(mesh.matrixWorld).invert();
    };
  }

  private createTreeIndexSet(geometry: BufferGeometry): Map<number, number> {
    const treeIndexAttribute = geometry.attributes['treeIndex'];
    if (!treeIndexAttribute) {
      return new Map();
    }

    const treeIndexSet = new Map<number, number>();

    for (let i = 0; i < treeIndexAttribute.count; i++) {
      incrementOrInsertIndex(treeIndexSet, (treeIndexAttribute as BufferAttribute).getX(i));
    }

    return treeIndexSet;
  }

  public setCacheSize(sectorCount: number): void {
    this._sectorRepository.setCacheSize(sectorCount);
  }

  public dispose(): void {
    this.nodeAppearanceProvider.dispose();
    this.materialManager.off('materialsChanged', this._setModelRenderLayers);
    this._materialManager.removeModelMaterials(this._cadModelMetadata.modelIdentifier.revealInternalId);

    // Dispose all tracked mesh groups and their resources
    this._sectorMeshGroups.forEach(meshGroup => {
      if (meshGroup.parent) {
        meshGroup.parent.remove(meshGroup);
      }

      // Manually dispose all resources
      for (const child of meshGroup.children) {
        if (child instanceof THREE.Mesh && child.geometry !== undefined) {
          child.geometry.dispose();
        }
      }

      // Dispose textures
      meshGroup.textures.forEach(texture => texture.dispose());

      // Clear the group
      meshGroup.clear();
    });
    this._sectorMeshGroups.clear();

    this._geometryBatchingManager?.dispose();
    this._rootSector?.dereferenceAllNodes();
    this._rootSector?.clear();
    this.clear();
    this._isDisposed = true;

    delete this._geometryBatchingManager;
    // @ts-ignore
    delete this._rootSector;
    // @ts-ignore
    delete this._sectorScene;
  }
}
