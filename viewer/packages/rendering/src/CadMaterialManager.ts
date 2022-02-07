/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { NodeAppearanceTextureBuilder } from './rendering/NodeAppearanceTextureBuilder';
import { NodeTransformTextureBuilder } from './transform/NodeTransformTextureBuilder';
import { NodeTransformProvider } from './transform/NodeTransformProvider';
import { createMaterials, Materials } from './rendering/materials';
import { RenderMode } from './rendering/RenderMode';

import { NodeAppearance, NodeAppearanceProvider } from '@reveal/cad-styling';
import { IndexSet, EventTrigger, assertNever } from '@reveal/utilities';

import throttle from 'lodash/throttle';

interface MaterialsWrapper {
  materials: Materials;
  perModelClippingPlanes: THREE.Plane[];
  nodeAppearanceProvider: NodeAppearanceProvider;
  nodeTransformProvider: NodeTransformProvider;
  nodeAppearanceTextureBuilder: NodeAppearanceTextureBuilder;
  nodeTransformTextureBuilder: NodeTransformTextureBuilder;
  updateMaterialsCallback: () => void;
  updateTransformsCallback: () => void;
}

export class CadMaterialManager {
  private readonly _events = {
    materialsChanged: new EventTrigger<() => void>()
  };

  get clippingPlanes(): THREE.Plane[] {
    return this._clippingPlanes;
  }

  set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._clippingPlanes = clippingPlanes;
    for (const modelIdentifier of this.materialsMap.keys()) {
      this.updateClippingPlanesForModel(modelIdentifier);
    }
    this.triggerMaterialsChanged();
  }

  private _renderMode: RenderMode = RenderMode.Color;
  private readonly materialsMap: Map<string, MaterialsWrapper> = new Map();
  // TODO: j-bjorne 29-04-2020: Move into separate cliping manager?
  private _clippingPlanes: THREE.Plane[] = [];

  public on(event: 'materialsChanged', listener: () => void): void {
    switch (event) {
      case 'materialsChanged':
        this._events.materialsChanged.subscribe(listener);
        break;

      default:
        assertNever(event, `Unexpected event '${event}`);
    }
  }

  public off(event: 'materialsChanged', listener: () => void): void {
    switch (event) {
      case 'materialsChanged':
        this._events.materialsChanged.unsubscribe(listener);
        break;

      default:
        assertNever(event, `Unexpected event '${event}`);
    }
  }

  addModelMaterials(modelIdentifier: string, maxTreeIndex: number): void {
    const nodeAppearanceProvider = new NodeAppearanceProvider();
    const nodeAppearanceTextureBuilder = new NodeAppearanceTextureBuilder(maxTreeIndex + 1, nodeAppearanceProvider);
    nodeAppearanceTextureBuilder.build();

    const nodeTransformProvider = new NodeTransformProvider();
    const nodeTransformTextureBuilder = new NodeTransformTextureBuilder(maxTreeIndex + 1, nodeTransformProvider);
    nodeTransformTextureBuilder.build();

    const materialUpdateThrottleDelay = 75;
    const updateMaterialsCallback: () => void = throttle(
      () => this.updateMaterials(modelIdentifier),
      materialUpdateThrottleDelay,
      {
        leading: true,
        trailing: true
      }
    );
    const updateTransformsCallback = () => this.updateTransforms(modelIdentifier);

    nodeAppearanceProvider.on('changed', updateMaterialsCallback);
    nodeTransformProvider.on('changed', updateTransformsCallback);

    const materials = createMaterials(
      this._renderMode,
      this._clippingPlanes,
      nodeAppearanceTextureBuilder.overrideColorPerTreeIndexTexture,
      nodeTransformTextureBuilder.overrideTransformIndexTexture,
      nodeTransformTextureBuilder.transformLookupTexture
    );
    this.materialsMap.set(modelIdentifier, {
      materials,
      perModelClippingPlanes: [],
      nodeAppearanceProvider,
      nodeTransformProvider,
      nodeAppearanceTextureBuilder,
      nodeTransformTextureBuilder,
      updateMaterialsCallback,
      updateTransformsCallback
    });

    this.updateClippingPlanesForModel(modelIdentifier);
  }

  getModelMaterials(modelIdentifier: string): Materials {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.materials;
  }

  getModelNodeAppearanceProvider(modelIdentifier: string): NodeAppearanceProvider {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeAppearanceProvider;
  }

  getModelNodeTransformProvider(modelIdentifier: string): NodeTransformProvider {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeTransformProvider;
  }

  getModelDefaultNodeAppearance(modelIdentifier: string): NodeAppearance {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeAppearanceTextureBuilder.getDefaultAppearance();
  }

  setModelClippingPlanes(modelIdentifier: string, clippingPlanes: THREE.Plane[]): void {
    const materialWrapper = this.materialsMap.get(modelIdentifier);
    if (materialWrapper === undefined) {
      throw new Error(
        `Materials for model ${modelIdentifier} has not been added, call ${this.addModelMaterials.name} first`
      );
    }

    materialWrapper.perModelClippingPlanes = clippingPlanes;
    this.updateClippingPlanesForModel(modelIdentifier);
    this.triggerMaterialsChanged();
  }

  private updateClippingPlanesForModel(modelIdentifier: string) {
    const materialWrapper = this.materialsMap.get(modelIdentifier);
    if (materialWrapper === undefined) {
      throw new Error(
        `Materials for model ${modelIdentifier} has not been added, call ${this.addModelMaterials.name} first`
      );
    }

    const clippingPlanes = [...materialWrapper.perModelClippingPlanes, ...this.clippingPlanes];
    const clippingPlanesAsUniform = clippingPlanes.map(
      p => new THREE.Vector4(p.normal.x, p.normal.y, p.normal.z, -p.constant)
    );

    applyToModelMaterials(materialWrapper.materials, m => {
      m.clipping = clippingPlanes.length > 0;
      m.clipIntersection = false;
      m.clippingPlanes = clippingPlanes;
      if (isRawShaderMaterial(m)) {
        applyClippingPlanesToRawShaderMaterial(m, clippingPlanesAsUniform);
      }
    });
  }

  setModelDefaultNodeAppearance(modelIdentifier: string, defaultAppearance: NodeAppearance): void {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    wrapper.nodeAppearanceTextureBuilder.setDefaultAppearance(defaultAppearance);
    this.updateMaterials(modelIdentifier);
  }

  getModelBackTreeIndices(modelIdentifier: string): IndexSet {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeAppearanceTextureBuilder.regularNodeTreeIndices;
  }

  getModelInFrontTreeIndices(modelIdentifier: string): IndexSet {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeAppearanceTextureBuilder.infrontNodeTreeIndices;
  }

  getModelGhostedTreeIndices(modelIdentifier: string): IndexSet {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeAppearanceTextureBuilder.ghostedNodeTreeIndices;
  }

  setRenderMode(mode: RenderMode): void {
    this._renderMode = mode;
    const colorWrite = mode !== RenderMode.DepthBufferOnly;
    this.applyToAllMaterials(material => {
      material.uniforms.renderMode.value = mode;
      material.colorWrite = colorWrite;
    });
  }

  getRenderMode(): RenderMode {
    return this._renderMode;
  }

  private updateMaterials(modelIdentifier: string) {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    if (wrapper.nodeAppearanceTextureBuilder.needsUpdate) {
      const { nodeAppearanceTextureBuilder } = wrapper;
      nodeAppearanceTextureBuilder.build();
    }
    this.triggerMaterialsChanged();
  }

  private updateTransforms(modelIdentifier: string) {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    if (wrapper.nodeTransformTextureBuilder.needsUpdate) {
      const { nodeTransformTextureBuilder, materials } = wrapper;
      nodeTransformTextureBuilder.build();

      const transformsLookupTexture = nodeTransformTextureBuilder.transformLookupTexture;
      const transformsLookupTextureSize = new THREE.Vector2(
        transformsLookupTexture.image.width,
        transformsLookupTexture.image.height
      );
      applyToModelMaterials(materials, material => {
        material.uniforms.transformOverrideTexture.value = transformsLookupTexture;
        material.uniforms.transformOverrideTextureSize.value = transformsLookupTextureSize;
      });
    }
    this.triggerMaterialsChanged();
  }

  private getModelMaterialsWrapper(modelIdentifier: string): MaterialsWrapper {
    const wrapper = this.materialsMap.get(modelIdentifier);
    if (wrapper === undefined) {
      throw new Error(`Model ${modelIdentifier} has not been added to MaterialManager`);
    }
    return wrapper;
  }

  private applyToAllMaterials(callback: (material: THREE.ShaderMaterial) => void) {
    for (const materialWrapper of this.materialsMap.values()) {
      const materials = materialWrapper.materials;
      applyToModelMaterials(materials, callback);
    }
  }

  private triggerMaterialsChanged() {
    this._events.materialsChanged.fire();
  }
}

function applyToModelMaterials(materials: Materials, callback: (material: THREE.ShaderMaterial) => void) {
  callback(materials.box);
  callback(materials.circle);
  callback(materials.generalRing);
  callback(materials.nut);
  callback(materials.quad);
  callback(materials.cone);
  callback(materials.eccentricCone);
  callback(materials.sphericalSegment);
  callback(materials.torusSegment);
  callback(materials.generalCylinder);
  callback(materials.trapezium);
  callback(materials.ellipsoidSegment);
  callback(materials.instancedMesh);
  callback(materials.triangleMesh);
  callback(materials.simple);
}

function isRawShaderMaterial(material: THREE.Material): material is THREE.RawShaderMaterial {
  return (material as any).isRawShaderMaterial === true;
}

function applyClippingPlanesToRawShaderMaterial(
  material: THREE.ShaderMaterial,
  clippingPlanesAsUniform: THREE.Vector4[]
) {
  material.defines = {
    ...material.defines,
    NUM_CLIPPING_PLANES: clippingPlanesAsUniform.length,
    UNION_CLIPPING_PLANES: 0
  };
  if (clippingPlanesAsUniform.length > 0) {
    material.uniforms['clippingPlanes'] = {
      value: clippingPlanesAsUniform
    };
  } else {
    delete material.uniforms['clippingPlanes'];
  }
}
