/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { CadMaterialManager } from '../CadMaterialManager';
import { RenderMode } from '../rendering/RenderMode';
import { RenderPass } from '../RenderPass';

export class GeometryPass implements RenderPass {
  private readonly _geometryScene: THREE.Object3D;
  private readonly _renderTarget: THREE.WebGLRenderTarget;
  private readonly _materialManager: CadMaterialManager;
  private readonly _renderMode: RenderMode;

  constructor(scene: THREE.Object3D, materialManager: CadMaterialManager, renderMode = RenderMode.Color) {
    this._geometryScene = scene;
    this._renderMode = renderMode;
    this._materialManager = materialManager;
  }

  public getOutputRenderTarget(): THREE.WebGLRenderTarget | null {
    return this._renderTarget;
  }

  public render(renderer: THREE.WebGLRenderer, camera: THREE.Camera): Promise<THREE.WebGLRenderTarget> {
    camera.layers.set(this._renderMode === RenderMode.Color ? 0 : this._renderMode);
    this._materialManager.setRenderMode(this._renderMode);
    this.setStuff();
    renderer.render(this._geometryScene, camera);
    camera.layers.set(0);
    this._geometryScene.traverse(p => {
      p.layers.set(0);
    });
    return;
  }

  private setStuff() {
    if (this._renderMode === RenderMode.Color) return;

    const modelModeIndices =
      this._renderMode === RenderMode.Effects
        ? this._materialManager.getModelInFrontTreeIndices('0')
        : this._materialManager.getModelGhostedTreeIndices('0');

    this._geometryScene.traverse(p => {
      const objectTreeIndices = p.userData?.treeIndices as Map<number, number> | undefined;
      if (objectTreeIndices === undefined) {
        return;
      }
      if (modelModeIndices.hasIntersectionWith(objectTreeIndices)) {
        p.layers.set(this._renderMode);
      }
    });
  }
}
