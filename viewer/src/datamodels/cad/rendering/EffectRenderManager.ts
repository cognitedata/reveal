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
import { RootSectorNode } from '../sector/RootSectorNode';

type Object3DStructure = {
  object: THREE.Object3D;
  parent: THREE.Object3D;
  sceneParent: THREE.Object3D;
};

export class EffectRenderManager {
  private readonly _materialManager: MaterialManager;
  private readonly _orthographicCamera: THREE.OrthographicCamera;

  private readonly _triScene: THREE.Scene;
  private readonly _backScene: THREE.Scene;
  private readonly _inFrontScene: THREE.Scene;
  private readonly _cadScene: THREE.Scene;
  private readonly _ghostScene: THREE.Scene;

  private readonly _combineEdgeDetectionMaterial: THREE.ShaderMaterial;

  private readonly _customObjectRenderTarget: THREE.WebGLRenderTarget;
  private readonly _ghostObjectRenderTarget: THREE.WebGLRenderTarget;
  private readonly _backRenderedCadModelTarget: THREE.WebGLRenderTarget;
  private readonly _frontRenderedCadModelTarget: THREE.WebGLRenderTarget;

  private readonly _rootSectorNodeBuffer: Set<[RootSectorNode, CadNode]> = new Set();
  private readonly _inFrontObjectBuffer: Set<Object3DStructure> = new Set();
  private readonly _backObjectBuffer: Set<Object3DStructure> = new Set();
  private readonly _ghostObjectBuffer: Set<Object3DStructure> = new Set();
  private readonly outlineTexelSize = 2;

  constructor(materialManager: MaterialManager) {
    this._materialManager = materialManager;
    this._orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this._cadScene = new THREE.Scene();
    this._backScene = new THREE.Scene();
    this._inFrontScene = new THREE.Scene();
    this._triScene = new THREE.Scene();
    this._ghostScene = new THREE.Scene();

    const outlineColorTexture = this.createOutlineColorTexture();

    this._frontRenderedCadModelTarget = new THREE.WebGLRenderTarget(0, 0, { stencilBuffer: false });
    this._frontRenderedCadModelTarget.depthTexture = new THREE.DepthTexture(0, 0);
    this._frontRenderedCadModelTarget.depthTexture.format = THREE.DepthFormat;
    this._frontRenderedCadModelTarget.depthTexture.type = THREE.UnsignedIntType;

    this._backRenderedCadModelTarget = new THREE.WebGLRenderTarget(0, 0, { stencilBuffer: false });
    this._backRenderedCadModelTarget.depthTexture = new THREE.DepthTexture(0, 0);
    this._backRenderedCadModelTarget.depthTexture.format = THREE.DepthFormat;
    this._backRenderedCadModelTarget.depthTexture.type = THREE.UnsignedIntType;

    this._ghostObjectRenderTarget = new THREE.WebGLRenderTarget(0, 0, { stencilBuffer: false });
    this._ghostObjectRenderTarget.depthTexture = new THREE.DepthTexture(0, 0);
    this._ghostObjectRenderTarget.depthTexture.format = THREE.DepthFormat;
    this._ghostObjectRenderTarget.depthTexture.type = THREE.UnsignedIntType;

    this._customObjectRenderTarget = new THREE.WebGLRenderTarget(0, 0, { stencilBuffer: false });
    this._customObjectRenderTarget.depthTexture = new THREE.DepthTexture(0, 0);
    this._customObjectRenderTarget.depthTexture.format = THREE.DepthFormat;
    this._customObjectRenderTarget.depthTexture.type = THREE.UnsignedIntType;

    this._combineEdgeDetectionMaterial = new THREE.ShaderMaterial({
      vertexShader: edgeDetectionShaders.vertex,
      fragmentShader: edgeDetectionShaders.combine,
      uniforms: {
        tFront: { value: this._frontRenderedCadModelTarget.texture },
        tFrontDepth: { value: this._frontRenderedCadModelTarget.depthTexture },
        tBack: { value: this._backRenderedCadModelTarget.texture },
        tBackDepth: { value: this._backRenderedCadModelTarget.depthTexture },
        tCustom: { value: this._customObjectRenderTarget.texture },
        tCustomDepth: { value: this._customObjectRenderTarget.depthTexture },
        tGhost: { value: this._ghostObjectRenderTarget.texture },
        tGhostDepth: { value: this._ghostObjectRenderTarget.depthTexture },
        tOutlineColors: { value: outlineColorTexture },
        cameraNear: { value: 0.1 },
        cameraFar: { value: 10000 }
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

    this.traverseForRootSectorNode(scene);

    this._rootSectorNodeBuffer.forEach(p => {
      if (p[1].parent !== scene && !(p[1].parent instanceof Cognite3DModel)) {
        throw new Error('CadNode must be put at scene root');
      }
      this._cadScene.add(p[0]);
    });

    try {
      this.updateRenderSize(renderer);
      renderer.setClearAlpha(0);

      this.splitToScenes();

      this.renderBackCadModels(renderer, camera);
      this.renderInFrontCadModels(renderer, camera);
      this.renderGhostedCadModels(renderer, camera);
      this.renderCustomObjects(renderer, scene, camera);

      renderer.setClearAlpha(original.clearAlpha);
      this.renderTargetToCanvas(renderer, camera);
    } finally {
      // Restore state
      this.restoreScenes();
      renderer.setClearAlpha(original.clearAlpha);
      renderer.setRenderTarget(original.renderTarget);
      this._materialManager.setRenderMode(original.renderMode);

      this._rootSectorNodeBuffer.forEach(p => {
        p[1].add(p[0]);
      });
      this._rootSectorNodeBuffer.clear();
    }
  }

  private splitToScenes() {
    this._rootSectorNodeBuffer.forEach(rootSectorNodeData => {
      const cadNode: CadNode = rootSectorNodeData[1];
      const root: RootSectorNode = rootSectorNodeData[0];

      const backSet = this._materialManager.getModelBackTreeIndices(cadNode.cadModelMetadata.blobUrl);
      const infrontSet = this._materialManager.getModelInFrontTreeIndices(cadNode.cadModelMetadata.blobUrl);
      const ghostSet = this._materialManager.getModelGhostedTreeIndices(cadNode.cadModelMetadata.blobUrl);

      const backRoot = new THREE.Object3D();
      backRoot.applyMatrix4(root.matrix);
      this._backScene.add(backRoot);

      const infrontRoot = new THREE.Object3D();
      infrontRoot.applyMatrix4(root.matrix);
      this._inFrontScene.add(infrontRoot);

      const ghostRoot = new THREE.Object3D();
      ghostRoot.applyMatrix4(root.matrix);
      this._ghostScene.add(ghostRoot);

      function storeToBuffer(buffer: Set<Object3DStructure>, element: THREE.Object3D, sceneParent: THREE.Object3D) {
        buffer.add({ object: element, parent: element.parent!, sceneParent });
      }

      const objectStack: THREE.Object3D[] = [rootSectorNodeData[0]];
      while (objectStack.length > 0) {
        const element = objectStack.pop()!;
        const objectTreeIndices = element.userData.treeIndices as Set<number> | undefined;

        if (objectTreeIndices) {
          if (infrontSet && hasIntersection(infrontSet, objectTreeIndices)) {
            storeToBuffer(this._inFrontObjectBuffer, element, infrontRoot);
          }
          if (ghostSet && hasIntersection(ghostSet, objectTreeIndices)) {
            storeToBuffer(this._ghostObjectBuffer, element, ghostRoot);
          }
          if (backSet && hasIntersection(backSet, objectTreeIndices)) {
            storeToBuffer(this._backObjectBuffer, element, backRoot);
          }
        } else {
          // Not a leaf, traverse children
          objectStack.push(...element.children);
        }
      }

      // Build scenes
      this._inFrontObjectBuffer.forEach(x => x.sceneParent.add(x.object));
      this._ghostObjectBuffer.forEach(x => x.sceneParent.add(x.object));
      this._backObjectBuffer.forEach(x => x.sceneParent.add(x.object));
    });
  }

  private restoreScenes() {
    this._inFrontObjectBuffer.forEach(p => {
      p.parent.add(p.object);
    });
    this._inFrontObjectBuffer.clear();
    this._inFrontScene.remove(...this._inFrontScene.children);

    this._ghostObjectBuffer.forEach(p => {
      p.parent.add(p.object);
    });
    this._ghostObjectBuffer.clear();
    this._ghostScene.remove(...this._ghostScene.children);

    this._backObjectBuffer.forEach(p => {
      p.parent.add(p.object);
    });
    this._backObjectBuffer.clear();
    this._backScene.remove(...this._backScene.children);
  }

  private renderBackCadModels(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    renderer.setRenderTarget(this._backRenderedCadModelTarget);
    this._materialManager.setRenderMode(RenderMode.Color);
    renderer.render(this._backScene, camera);
  }

  private renderInFrontCadModels(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    renderer.setRenderTarget(this._frontRenderedCadModelTarget);
    this._materialManager.setRenderMode(RenderMode.Effects);
    renderer.render(this._inFrontScene, camera);
    this._materialManager.setRenderMode(RenderMode.Color);
  }

  private renderGhostedCadModels(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    renderer.setRenderTarget(this._ghostObjectRenderTarget);
    this._materialManager.setRenderMode(RenderMode.Ghost);
    renderer.render(this._ghostScene, camera);
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
      this._ghostObjectRenderTarget.setSize(renderSize.x, renderSize.y);

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
    this._combineEdgeDetectionMaterial.uniforms.cameraNear.value = camera.near;
    this._combineEdgeDetectionMaterial.uniforms.cameraFar.value = camera.far;

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

  private traverseForRootSectorNode(root: THREE.Object3D) {
    const objectStack = [root];

    while (objectStack.length > 0) {
      const element = objectStack.pop()!;
      if (element instanceof RootSectorNode) {
        this._rootSectorNodeBuffer.add([element, element.parent! as CadNode]);
      } else if (element instanceof THREE.Group) {
        continue;
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
  const needles = left.size < right.size ? left : right;
  const haystack = left.size > right.size ? left : right;

  let intersects = false;
  const it = needles.values();
  let itCurr = it.next();
  while (!intersects && !itCurr.done) {
    intersects = haystack.has(itCurr.value);
    itCurr = it.next();
  }

  return intersects;
}
