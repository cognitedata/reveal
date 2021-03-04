/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { createMaterials, Materials } from './rendering/materials';
import { RenderMode } from './rendering/RenderMode';
import { IndexSet } from '../../utilities/IndexSet';

import { NodeAppearanceProvider } from './styling/NodeAppearanceProvider';
import { NodeAppearanceTextureBuilder } from './styling/NodeAppearanceTextureBuilder';
import { NodeAppearance } from '.';
import { EventTrigger } from '../../utilities/events';
import { assertNever } from '../../utilities';
import { NodeTransformTextureBuilder } from './styling/NodeTransformTextureBuilder';
import { NodeTransformProvider } from './styling/NodeTransformProvider';

interface MaterialsWrapper {
  materials: Materials;
  nodeAppearanceProvider: NodeAppearanceProvider;
  nodeTransformProvider: NodeTransformProvider;
  nodeApperanceTextureBuilder: NodeAppearanceTextureBuilder;
  nodeTransformTextureBuilder: NodeTransformTextureBuilder;
}

export class MaterialManager {
  private readonly _events = {
    materialsChanged: new EventTrigger<() => void>()
  };

  get clippingPlanes(): THREE.Plane[] {
    return this._clippingPlanes;
  }

  set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._clippingPlanes = clippingPlanes;
    this.applyToAllMaterials(material => {
      material.clippingPlanes = clippingPlanes;
    });
    this.triggerMaterialsChanged();
  }

  get clipIntersection(): boolean {
    return this._clipIntersection;
  }

  set clipIntersection(intersection: boolean) {
    this._clipIntersection = intersection;
    this.applyToAllMaterials(material => {
      material.clipIntersection = intersection;
    });
    this.triggerMaterialsChanged();
  }

  private _renderMode: RenderMode = RenderMode.Color;
  private readonly materialsMap: Map<string, MaterialsWrapper> = new Map();
  // TODO: j-bjorne 29-04-2020: Move into separate cliping manager?
  private _clippingPlanes: THREE.Plane[] = [];
  private _clipIntersection: boolean = false;

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

  addModelMaterials(modelIdentifier: string, maxTreeIndex: number) {
    const nodeAppearanceProvider = new NodeAppearanceProvider();
    const nodeApperanceTextureBuilder = new NodeAppearanceTextureBuilder(maxTreeIndex + 1, nodeAppearanceProvider);
    nodeApperanceTextureBuilder.build();

    const nodeTransformProvider = new NodeTransformProvider();
    const nodeTransformTextureBuilder = new NodeTransformTextureBuilder(maxTreeIndex + 1, nodeTransformProvider);
    nodeTransformTextureBuilder.build();

    nodeAppearanceProvider.on('changed', () => {
      this.updateMaterials(modelIdentifier);
    });
    nodeTransformProvider.on('changed', () => {
      this.updateMaterials(modelIdentifier);
    });

    const materials = createMaterials(
      this._renderMode,
      this._clippingPlanes,
      nodeApperanceTextureBuilder.overrideColorPerTreeIndexTexture,
      nodeTransformTextureBuilder.overrideTransformIndexTexture,
      nodeTransformTextureBuilder.transformLookupTexture
    );
    this.materialsMap.set(modelIdentifier, {
      materials,
      nodeAppearanceProvider,
      nodeTransformProvider,
      nodeApperanceTextureBuilder,
      nodeTransformTextureBuilder
    });
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
    return wrapper.nodeApperanceTextureBuilder.getDefaultAppearance();
  }

  setModelDefaultNodeAppearance(modelIdentifier: string, defaultAppearance: NodeAppearance) {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    wrapper.nodeApperanceTextureBuilder.setDefaultAppearance(defaultAppearance);
    this.updateMaterials(modelIdentifier);
  }

  getModelBackTreeIndices(modelIdentifier: string): IndexSet {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeApperanceTextureBuilder.regularNodeTreeIndices;
  }

  getModelInFrontTreeIndices(modelIdentifier: string): IndexSet {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeApperanceTextureBuilder.infrontNodeTreeIndices;
  }

  getModelGhostedTreeIndices(modelIdentifier: string): IndexSet {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeApperanceTextureBuilder.ghostedNodeTreeIndices;
  }

  setRenderMode(mode: RenderMode) {
    this._renderMode = mode;
    const transparent = mode === RenderMode.Ghost;
    this.applyToAllMaterials(material => {
      material.uniforms.renderMode.value = mode;
      material.transparent = transparent;
    });
    this.triggerMaterialsChanged();
  }

  getRenderMode(): RenderMode {
    return this._renderMode;
  }

  private updateMaterials(modelIdentifier: string) {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    if (wrapper.nodeApperanceTextureBuilder.needsUpdate) {
      const start = performance.now();
      const { nodeApperanceTextureBuilder } = wrapper;
      nodeApperanceTextureBuilder.build();

      console.log('Updating materials for ', modelIdentifier, 'took', performance.now() - start, 'ms');
    }

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
