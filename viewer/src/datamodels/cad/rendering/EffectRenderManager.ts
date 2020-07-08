/*!
 * Copyright 2020 Cognite AS
 */

import { MaterialManager } from '../MaterialManager';
import { RenderMode } from './RenderMode';
import * as THREE from 'three';
import { edgeDetectionShaders } from './shaders';
import { CogniteColors } from '@/utilities';
import { CadNode } from '..';
import { Cognite3DModel } from '@/migration';
import { Object3D } from 'three';

export class EffectRenderManager {
  private _materialManager: MaterialManager;
  private _orthographicCamera: THREE.OrthographicCamera;

  private _triScene: THREE.Scene;
  private _cadScene: THREE.Scene;

  private _combineEdgeDetectionMaterial: THREE.ShaderMaterial;

  private _customObjectRenderTarget: THREE.WebGLRenderTarget;
  private _backRenderedCadModelTarget: THREE.WebGLRenderTarget;
  private _frontRenderedCadModelTarget: THREE.WebGLRenderTarget;

  private _cadModelBuffer: Set<[CadNode, Object3D]> = new Set();

  private readonly outlineTexelSize = 2;

  constructor(materialManager: MaterialManager) {
    this._materialManager = materialManager;
    this._orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this._cadScene = new THREE.Scene();
    this._triScene = new THREE.Scene();

    const outlineColorTexture = this.createOutlineColorTexture();

    this._frontRenderedCadModelTarget = new THREE.WebGLRenderTarget(0, 0, { stencilBuffer: false });

    this._backRenderedCadModelTarget = new THREE.WebGLRenderTarget(0, 0, { stencilBuffer: false });
    this._backRenderedCadModelTarget.depthTexture = new THREE.DepthTexture(0, 0);
    this._backRenderedCadModelTarget.depthTexture.format = THREE.DepthFormat;
    this._backRenderedCadModelTarget.depthTexture.type = THREE.UnsignedIntType;

    this._customObjectRenderTarget = new THREE.WebGLRenderTarget(0, 0, { stencilBuffer: false });
    this._customObjectRenderTarget.depthTexture = new THREE.DepthTexture(0, 0);
    this._customObjectRenderTarget.depthTexture.format = THREE.DepthFormat;
    this._customObjectRenderTarget.depthTexture.type = THREE.UnsignedIntType;

    this._combineEdgeDetectionMaterial = new THREE.ShaderMaterial({
      vertexShader: edgeDetectionShaders.vertex,
      fragmentShader: edgeDetectionShaders.combine,
      uniforms: {
        tFront: { value: this._frontRenderedCadModelTarget.texture },
        tBack: { value: this._backRenderedCadModelTarget.texture },
        tBackDepth: { value: this._backRenderedCadModelTarget.depthTexture },
        tCustom: { value: this._customObjectRenderTarget.texture },
        tCustomDepth: { value: this._customObjectRenderTarget.depthTexture },
        tOutlineColors: { value: outlineColorTexture }
      },
      depthTest: false
    });

    this.setupTextureRenderScene(this._combineEdgeDetectionMaterial);
  }

  public render(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const original = {
      clearAlpha: renderer.getClearAlpha(),
      renderTarget: renderer.getRenderTarget(),
      renderMode: this._materialManager.getRenderMode()
    };
    this.updateRenderSize(renderer);

    this.traverseForCadNodes(scene);

    this._cadModelBuffer.forEach(p => {
      if (p[1] !== scene && !(p[1] instanceof Cognite3DModel)) {
        throw new Error('CadNode must be put at scene root');
      }
      this._cadScene.add(p[0]);
    });

    try {
      this.updateRenderSize(renderer);

      renderer.setClearAlpha(0);

      // Render behind cad models
      this.renderBackCadModels(renderer, camera);

      // Render in -front cad models
      this.renderInFrontCadModels(renderer, camera);

      // Render custom objects
      this.renderCustomObjects(renderer, scene, camera);

      renderer.setClearAlpha(1);

      this.renderTargetToCanvas(renderer, camera);
    } finally {
      // Restore state
      renderer.setClearAlpha(original.clearAlpha);
      renderer.setRenderTarget(original.renderTarget);
      this._materialManager.setRenderMode(original.renderMode);

      this._cadModelBuffer.forEach(p => {
        p[1].add(p[0]);
      });
      this._cadModelBuffer.clear();
    }
  }

  private renderBackCadModels(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    renderer.setRenderTarget(this._backRenderedCadModelTarget);
    renderer.render(this._cadScene, camera);
  }

  private renderInFrontCadModels(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    renderer.setRenderTarget(this._frontRenderedCadModelTarget);

    let containsRenderInFront = false;
    this._cadModelBuffer.forEach(cadModelData => {
      const cadModel = cadModelData[0];
      const inFrontSet = this._materialManager.getModelInFrontTreeIndices(cadModel.cadModelMetadata.blobUrl);

      if (!inFrontSet) {
        return;
      }
      cadModel.traverseVisible(object => {
        const objectTreeIndices = object.userData.treeIndecies as Set<number> | undefined;

        if (objectTreeIndices && hasIntersection(inFrontSet, objectTreeIndices)) {
          containsRenderInFront = true;
          return;
        }
      });
    });

    if (!containsRenderInFront) {
      renderer.clear();
      return;
    }

    this._materialManager.setRenderMode(RenderMode.Effects);

    renderer.render(this._cadScene, camera);

    this._materialManager.setRenderMode(RenderMode.Color);
  }

  private renderCustomObjects(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    if (scene.children.length === 0) {
      return;
    }

    renderer.setRenderTarget(this._customObjectRenderTarget);
    renderer.render(scene, camera);
  }

  private updateRenderSize(renderer: THREE.WebGLRenderer) {
    const renderSize = new THREE.Vector2();
    renderer.getSize(renderSize);

    if (
      renderSize.x !== this._backRenderedCadModelTarget.width ||
      renderSize.y !== this._backRenderedCadModelTarget.height
    ) {
      this._backRenderedCadModelTarget.setSize(renderSize.x, renderSize.y);
      this._frontRenderedCadModelTarget.setSize(renderSize.x, renderSize.y);
      this._customObjectRenderTarget.setSize(renderSize.x, renderSize.y);

      this._combineEdgeDetectionMaterial.setValues({
        uniforms: {
          ...this._combineEdgeDetectionMaterial.uniforms,
          texelSize: {
            value: new THREE.Vector2(this.outlineTexelSize / renderSize.x, this.outlineTexelSize / renderSize.y)
          }
        }
      });
    }
    return renderSize;
  }

  private renderTargetToCanvas(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    this._combineEdgeDetectionMaterial.setValues({
      uniforms: {
        ...this._combineEdgeDetectionMaterial.uniforms,
        cameraNear: { value: camera.near },
        cameraFar: { value: camera.far }
      }
    });

    renderer.setRenderTarget(null);
    renderer.render(this._triScene, this._orthographicCamera);
  }

  private createOutlineColorTexture(): THREE.DataTexture {
    const outlineColorBuffer = new Uint8Array(8 * 4);
    const outlineColorTexture = new THREE.DataTexture(outlineColorBuffer, 8, 1);
    setOutlineColor(outlineColorTexture.image.data, 1, CogniteColors.White);
    setOutlineColor(outlineColorTexture.image.data, 2, CogniteColors.Black);
    setOutlineColor(outlineColorTexture.image.data, 3, CogniteColors.Cyan);
    setOutlineColor(outlineColorTexture.image.data, 4, CogniteColors.Blue);
    setOutlineColor(outlineColorTexture.image.data, 5, CogniteColors.Purple);
    setOutlineColor(outlineColorTexture.image.data, 6, CogniteColors.Pink);
    setOutlineColor(outlineColorTexture.image.data, 7, CogniteColors.Orange);
    return outlineColorTexture;
  }

  private setupTextureRenderScene(material: THREE.ShaderMaterial) {
    const geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-1, -1, 0));
    geometry.vertices.push(new THREE.Vector3(3, -1, 0));
    geometry.vertices.push(new THREE.Vector3(-1, 3, 0));

    const face = new THREE.Face3(0, 1, 2);
    geometry.faces.push(face);

    geometry.faceVertexUvs[0].push([new THREE.Vector2(0, 0), new THREE.Vector2(2, 0), new THREE.Vector2(0, 2)]);

    const mesh = new THREE.Mesh(geometry, material);

    this._triScene.add(mesh);
  }

  private traverseForCadNodes(root: Object3D) {
    const objectStack = [root];

    while (objectStack.length > 0) {
      const element = objectStack.pop()!;
      if (element instanceof CadNode) {
        this._cadModelBuffer.add([element, element.parent!]);
      } else {
        objectStack.push(...element.children);
      }
    }
  }
}

function setOutlineColor(outlineTextureData: Uint8ClampedArray, colorIndex: number, color: THREE.Color) {
  outlineTextureData[4 * colorIndex + 0] = Math.floor(255 * color.r);
  outlineTextureData[4 * colorIndex + 1] = Math.floor(255 * color.g);
  outlineTextureData[4 * colorIndex + 2] = Math.floor(255 * color.b);
  outlineTextureData[4 * colorIndex + 3] = 255;
}

function hasIntersection(left: Set<number>, right: Set<number>): boolean {
  const iterator = left.size < right.size ? left : right;
  const iteratee = left.size > right.size ? left : right;

  let intersects = false;

  iterator.forEach(p => {
    if (iteratee.has(p)) {
      intersects = true;
      return;
    }
  });

  return intersects;
}
