/*!
 * Copyright 2020 Cognite AS
 */

import { MaterialManager } from '../MaterialManager';
import { RenderMode } from './RenderMode';
import * as THREE from 'three';
import { Vector2, DataTexture } from 'three';
import { edgeDetectionShaders } from './shaders';

export class EffectRenderManager {
  private _materialManager: MaterialManager;
  private _orthographicCamera: THREE.OrthographicCamera;
  private _triScene: THREE.Scene;
  private _windowTriangleMaterial: THREE.ShaderMaterial;
  private _baseModelTarget: THREE.WebGLRenderTarget;
  private _highlightedModelTarget: THREE.WebGLRenderTarget;

  private readonly outlineTexelSize = 2;

  constructor(materialManager: MaterialManager) {
    this._materialManager = materialManager;
    this._orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this._triScene = new THREE.Scene();

    const outlineColorTexture = this.createOutlineColorTexture();

    this._windowTriangleMaterial = new THREE.ShaderMaterial({
      vertexShader: edgeDetectionShaders.vertex,
      fragmentShader: edgeDetectionShaders.fragment,
      uniforms: {
        tOutlineColors: { value: outlineColorTexture }
      }
    });
    this.setupTextureRenderScene();

    this._baseModelTarget = new THREE.WebGLRenderTarget(0, 0, { stencilBuffer: false });
    this._highlightedModelTarget = new THREE.WebGLRenderTarget(0, 0, { stencilBuffer: false });
  }

  public addPostRenderEffects(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
    this.updateRenderSize(renderer);

    renderer.setClearAlpha(0);

    renderer.setRenderTarget(this._baseModelTarget);
    renderer.render(scene, camera);

    this._materialManager.setRenderMode(RenderMode.Effects);

    renderer.setRenderTarget(this._highlightedModelTarget);
    renderer.render(scene, camera);

    this._materialManager.setRenderMode(RenderMode.Color);

    renderer.setClearAlpha(1);

    this.renderTargetToCanvas(renderer);
  }

  private updateRenderSize(renderer: THREE.WebGLRenderer) {
    const renderSize = new THREE.Vector2();
    renderer.getSize(renderSize);

    if (renderSize.x !== this._baseModelTarget.width || renderSize.y !== this._baseModelTarget.height) {
      this._baseModelTarget.setSize(renderSize.x, renderSize.y);
      this._highlightedModelTarget.setSize(renderSize.x, renderSize.y);

      this._windowTriangleMaterial.setValues({
        uniforms: {
          ...this._windowTriangleMaterial.uniforms,
          texelSize: {
            value: new THREE.Vector2(this.outlineTexelSize / renderSize.x, this.outlineTexelSize / renderSize.y)
          }
        }
      });
    }
    return renderSize;
  }

  private renderTargetToCanvas(renderer: THREE.WebGLRenderer) {
    this._windowTriangleMaterial.setValues({
      uniforms: {
        ...this._windowTriangleMaterial.uniforms,
        tSelected: { value: this._highlightedModelTarget.texture },
        tBase: { value: this._baseModelTarget.texture }
      }
    });

    renderer.setRenderTarget(null);
    renderer.render(this._triScene, this._orthographicCamera);
  }

  private createOutlineColorTexture(): THREE.DataTexture {
    const outlineColorBuffer = new Uint8Array(8 * 4);
    const outlineColorTexture = new DataTexture(outlineColorBuffer, 8, 1);

    // red
    outlineColorTexture.image.data[4] = 255;
    outlineColorTexture.image.data[5] = 0;
    outlineColorTexture.image.data[6] = 0;
    outlineColorTexture.image.data[7] = 255;

    // green
    outlineColorTexture.image.data[8] = 0;
    outlineColorTexture.image.data[9] = 255;
    outlineColorTexture.image.data[10] = 0;
    outlineColorTexture.image.data[11] = 255;

    // blue
    outlineColorTexture.image.data[12] = 0;
    outlineColorTexture.image.data[13] = 0;
    outlineColorTexture.image.data[14] = 255;
    outlineColorTexture.image.data[15] = 255;

    // yellow
    outlineColorTexture.image.data[16] = 255;
    outlineColorTexture.image.data[17] = 255;
    outlineColorTexture.image.data[18] = 0;
    outlineColorTexture.image.data[19] = 255;

    // purple
    outlineColorTexture.image.data[20] = 255;
    outlineColorTexture.image.data[21] = 0;
    outlineColorTexture.image.data[22] = 255;
    outlineColorTexture.image.data[23] = 255;

    // light blue
    outlineColorTexture.image.data[24] = 0;
    outlineColorTexture.image.data[25] = 255;
    outlineColorTexture.image.data[26] = 255;
    outlineColorTexture.image.data[27] = 255;

    // white
    outlineColorTexture.image.data[28] = 255;
    outlineColorTexture.image.data[29] = 255;
    outlineColorTexture.image.data[30] = 255;
    outlineColorTexture.image.data[31] = 255;

    return outlineColorTexture;
  }

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
