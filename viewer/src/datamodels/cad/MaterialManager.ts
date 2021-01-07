/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { createMaterials, Materials } from './rendering/materials';
import { RenderMode } from './rendering/RenderMode';
import { NodeAppearanceProvider } from './NodeAppearance';
import { TransformOverrideBuffer } from './rendering/TransformOverrideBuffer';

interface MaterialsWrapper {
  materials: Materials;
  nodeAppearanceProvider?: NodeAppearanceProvider;
}

export class MaterialManager {
  get clippingPlanes(): THREE.Plane[] {
    return this._clippingPlanes;
  }

  set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._clippingPlanes = clippingPlanes;
    this.applyToAllMaterials(material => {
      material.clippingPlanes = clippingPlanes;
    });
  }

  get clipIntersection(): boolean {
    return this._clipIntersection;
  }

  set clipIntersection(intersection: boolean) {
    this._clipIntersection = intersection;
    this.applyToAllMaterials(material => {
      material.clipIntersection = intersection;
    });
  }
  private _renderMode: RenderMode = RenderMode.Color;
  private readonly materialsMap: Map<string, MaterialsWrapper> = new Map();
  // TODO: j-bjorne 29-04-2020: Move into separate cliping manager?
  private _clippingPlanes: THREE.Plane[] = [];
  private _clipIntersection: boolean = false;

  private readonly _backTreeIndices = new Map<string, Set<number>>();
  private readonly _inFrontTreeIndices = new Map<string, Set<number>>();
  private readonly _ghostTreeIndices = new Map<string, Set<number>>();

  addModelMaterials(modelIdentifier: string, maxTreeIndex: number) {
    const materials = createMaterials(maxTreeIndex + 1, this._renderMode, this._clippingPlanes);
    this.materialsMap.set(modelIdentifier, { materials });

    this._backTreeIndices.set(modelIdentifier, new Set());
    this._inFrontTreeIndices.set(modelIdentifier, new Set());
    this._ghostTreeIndices.set(modelIdentifier, new Set());
  }

  setNodeAppearanceProvider(modelIdentifier: string, nodeAppearanceProvider?: NodeAppearanceProvider) {
    const wrapper = this.materialsMap.get(modelIdentifier)!;
    const newWrapper: MaterialsWrapper = { ...wrapper, nodeAppearanceProvider };
    this.materialsMap.set(modelIdentifier, newWrapper);
  }

  getModelMaterials(modelIdentifier: string): Materials {
    return this.materialsMap.get(modelIdentifier)!.materials;
  }

  getModelNodeAppearanceProvider(modelIdentifier: string): NodeAppearanceProvider | undefined {
    return this.materialsMap.get(modelIdentifier)!.nodeAppearanceProvider;
  }

  getModelBackTreeIndices(modelIdentifier: string): Set<number> {
    const set = this._backTreeIndices.get(modelIdentifier);
    if (!set) {
      throw new Error(`Invalid model identifier '${modelIdentifier}'`);
    }
    return set;
  }

  getModelInFrontTreeIndices(modelIdentifier: string): Set<number> {
    const set = this._inFrontTreeIndices.get(modelIdentifier);
    if (!set) {
      throw new Error(`Invalid model identifier '${modelIdentifier}'`);
    }
    return set;
  }

  getModelGhostedTreeIndices(modelIdentifier: string): Set<number> {
    const set = this._ghostTreeIndices.get(modelIdentifier);
    if (!set) {
      throw new Error(`Invalid model identifier '${modelIdentifier}'`);
    }
    return set;
  }

  setRenderMode(mode: RenderMode) {
    this._renderMode = mode;
    const transparent = mode === RenderMode.Ghost;
    const side = mode === RenderMode.Ghost ? THREE.DoubleSide : THREE.FrontSide;
    this.applyToAllMaterials(material => {
      material.uniforms.renderMode.value = mode;
      material.transparent = transparent;
      material.side = side;
    });
  }

  getRenderMode(): RenderMode {
    return this._renderMode;
  }

  updateModelNodes(modelIdentifier: string, treeIndices: number[]) {
    const materialsWrapper = this.materialsMap.get(modelIdentifier);
    const materials = materialsWrapper!.materials;
    const appearanceProvider = materialsWrapper!.nodeAppearanceProvider;
    if (!appearanceProvider) {
      return;
    }
    if (treeIndices.length === 0) {
      return;
    }

    this.updateNodeAppearance(appearanceProvider, materials, treeIndices, modelIdentifier);
  }

  private updateNodeAppearance(
    appearanceProvider: NodeAppearanceProvider | undefined,
    materials: Materials,
    treeIndices: number[],
    modelIdentifier: string
  ) {
    if (!appearanceProvider) {
      return;
    }

    const count = treeIndices.length;
    const backSet = this._backTreeIndices.get(modelIdentifier)!;
    const inFrontSet = this._inFrontTreeIndices.get(modelIdentifier)!;
    const ghostSet = this._ghostTreeIndices.get(modelIdentifier)!;
    for (let i = 0; i < count; ++i) {
      const treeIndex = treeIndices[i];
      const style = appearanceProvider.styleNode(treeIndex) || {};

      // Override color
      materials.overrideColorPerTreeIndex.image.data[4 * treeIndex] = style.color ? style.color[0] : 0;
      materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 1] = style.color ? style.color[1] : 0;
      materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 2] = style.color ? style.color[2] : 0;

      const infront = !!style.renderInFront;
      const ghosted = !!style.renderGhosted;
      if (infront) {
        inFrontSet.add(treeIndex);
      } else {
        inFrontSet.delete(treeIndex);
      }

      if (ghosted) {
        ghostSet.add(treeIndex);
      } else {
        ghostSet.delete(treeIndex);
      }

      if (!ghosted && !infront) {
        backSet.add(treeIndex);
      } else {
        backSet.delete(treeIndex);
      }

      const visible = style.visible === undefined ? true : style.visible;
      // Byte layout:
      // [isVisible, renderInFront, renderGhosted, outlineColor0, outlineColor1, outlineColor2, unused, unused]
      const bytePattern =
        (visible ? 1 << 0 : 0) +
        (style.renderInFront ? 1 << 1 : 0) +
        (style.renderGhosted ? 1 << 2 : 0) +
        (style.outlineColor ? style.outlineColor << 3 : 0);
      materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 3] = bytePattern;
      materials.overrideColorPerTreeIndex.needsUpdate = true;

      if (style.worldTransform === undefined) {
        if (materials.transformOverrideBuffer.overrideIndices.has(treeIndex)) {
          this.removeOverrideTreeIndexTransform(
            treeIndex,
            materials.transformOverrideIndexTexture,
            materials.transformOverrideBuffer
          );
        }
      } else {
        const overrideMatrix = style.worldTransform;

        this.overrideTreeIndexTransform(
          treeIndex,
          overrideMatrix,
          materials.transformOverrideIndexTexture,
          materials.transformOverrideBuffer
        );
      }
    }
  }

  private overrideTreeIndexTransform(
    treeIndex: number,
    transform: THREE.Matrix4,
    indexTexture: THREE.DataTexture,
    transformTextureBuffer: TransformOverrideBuffer
  ) {
    const transformIndex = transformTextureBuffer.addOverrideTransform(treeIndex, transform);

    indexTexture.image.data[treeIndex * 3 + 0] = (transformIndex + 1) >> 16;
    indexTexture.image.data[treeIndex * 3 + 1] = (transformIndex + 1) >> 8;
    indexTexture.image.data[treeIndex * 3 + 2] = (transformIndex + 1) >> 0;

    indexTexture.needsUpdate = true;
  }

  private removeOverrideTreeIndexTransform(
    treeIndex: number,
    indexTexture: THREE.DataTexture,
    transformTextureBuffer: TransformOverrideBuffer
  ) {
    indexTexture.image.data[treeIndex * 3 + 0] = 0;
    indexTexture.image.data[treeIndex * 3 + 1] = 0;
    indexTexture.image.data[treeIndex * 3 + 2] = 0;

    transformTextureBuffer.removeOverrideTransform(treeIndex);

    indexTexture.needsUpdate = true;
  }

  private applyToAllMaterials(callback: (material: THREE.ShaderMaterial) => void) {
    for (const materialWrapper of this.materialsMap.values()) {
      const materials = materialWrapper.materials;
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
  }
}
