/*!
 * Copyright 2020 Cognite AS
 */

import { MaterialManager } from '../MaterialManager';
import { RenderMode } from './RenderMode';
import * as THREE from 'three';
import { Vector2 } from 'three';
// import { edgeDetectionShaders } from './shaders';

export class EffectRenderManager {
  private _materialManager: MaterialManager;
  private _orthographicCamera: THREE.OrthographicCamera;
  private _triScene: THREE.Scene;
  private _windowTriangleMaterial: THREE.ShaderMaterial;
  constructor(materialManager: MaterialManager) {
    this._materialManager = materialManager;
    this._orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this._triScene = new THREE.Scene();
    this._windowTriangleMaterial = new THREE.ShaderMaterial({});
    this.setupTextureRenderScene();
  }

  public addPostRenderEffects(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
    // const { preserveDrawingBuffer } = renderer.getContextAttributes()!;

    // if (!preserveDrawingBuffer) {
    //   throw new Error('The renderer must have the parameter: preserveDrawingBuffer set to true');
    // }

    const test = new THREE.Vector2();
    renderer.getSize(test);

    // const baseModelTarget = new THREE.WebGLRenderTarget(test.x, test.y);
    // const highlightedModelTarget = new THREE.WebGLRenderTarget(test.x, test.y);

    const baseModelTarget = new THREE.WebGLRenderTarget(test.x, test.y);
    const highlightedModelTarget = new THREE.WebGLRenderTarget(test.x, test.y);

    renderer.setRenderTarget(baseModelTarget);
    renderer.render(scene, camera);

    renderer.setRenderTarget(highlightedModelTarget);
    renderer.render(scene, camera);

    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    // renderer.clear

    // renderer.setRenderTarget(highlightedModelTarget);
    // renderer.clear();
    // this._materialManager.setRenderMode(RenderMode.Effects);
    // renderer.clearDepth();
    // renderer.autoClearColor = false;
    // renderer.render(scene, camera);
    // this._materialManager.setRenderMode(RenderMode.Color);

    // this.renderTargetToCanvas(renderer, baseModelTarget);

    // const currentClearMode = renderer.autoClearColor;
    // const currentRenderMode = this._materialManager.getRenderMode();
    // this._materialManager.setRenderMode(RenderMode.Effects);
    // renderer.clearDepth();
    // renderer.autoClearColor = false;
    // renderer.render(scene, camera);
    // renderer.autoClearColor = currentClearMode;
    // this._materialManager.setRenderMode(currentRenderMode);

    // edgeDetectionShaders;
  }

  // private renderTargetToCanvas(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget) {
  //   this._windowTriangleMaterial.map = target.texture;

  //   renderer.setRenderTarget(null);
  //   renderer.render(this._triScene, this._orthographicCamera);
  // }

  private setupTextureRenderScene() {
    const geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-1, -1, 0));
    geometry.vertices.push(new THREE.Vector3(3, -1, 0));
    geometry.vertices.push(new THREE.Vector3(-1, 3, 0));
    const face = new THREE.Face3(0, 1, 2);
    geometry.faces.push(face);

    geometry.faceVertexUvs[0].push([new Vector2(0, 0), new Vector2(2, 0), new Vector2(0, 2)]);

    const mesh = new THREE.Mesh(geometry, this._windowTriangleMaterial);

    this._triScene.add(mesh);
  }
}
