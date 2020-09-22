/*!
 * Copyright 2020 Cognite AS
 */

import { MaterialManager } from '../MaterialManager';
import { RenderMode } from './RenderMode';
import * as THREE from 'three';
import { edgeDetectionShaders, fxaaShaders } from './shaders';
import { CogniteColors } from '@/utilities';
import { CadNode } from '..';
import { Cognite3DModel } from '@/migration';
import { RootSectorNode } from '../sector/RootSectorNode';

export class EffectRenderManager {
  private readonly _materialManager: MaterialManager;
  private readonly _orthographicCamera: THREE.OrthographicCamera;

  private readonly _compositionScene: THREE.Scene;
  private readonly _fxaaScene: THREE.Scene;
  private readonly _inFrontScene: THREE.Scene;
  private readonly _cadScene: THREE.Scene;
  private readonly _backScene: THREE.Scene;
  private readonly _backSceneBuilder: TemporarySceneBuilder;
  private readonly _inFrontSceneBuilder: TemporarySceneBuilder;

  private readonly _combineEdgeDetectionMaterial: THREE.ShaderMaterial;
  private readonly _fxaaMaterial: THREE.ShaderMaterial;

  private readonly _customObjectRenderTarget: THREE.WebGLRenderTarget;
  private readonly _ghostObjectRenderTarget: THREE.WebGLRenderTarget;
  private readonly _backRenderedCadModelTarget: THREE.WebGLRenderTarget;
  private readonly _frontRenderedCadModelTarget: THREE.WebGLRenderTarget;
  private readonly _compositionTarget: THREE.WebGLRenderTarget;

  private readonly _rootSectorNodeBuffer: Set<[RootSectorNode, CadNode]> = new Set();
  private readonly outlineTexelSize = 2;

  constructor(materialManager: MaterialManager) {
    this._materialManager = materialManager;
    this._orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this._cadScene = new THREE.Scene();
    this._backScene = new THREE.Scene();
    this._inFrontScene = new THREE.Scene();
    this._compositionScene = new THREE.Scene();
    this._fxaaScene = new THREE.Scene();
    this._backSceneBuilder = new TemporarySceneBuilder(this._backScene);
    this._inFrontSceneBuilder = new TemporarySceneBuilder(this._inFrontScene);

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

    this._compositionTarget = new THREE.WebGLRenderTarget(0, 0, { stencilBuffer: false, depthBuffer: false });

    this._combineEdgeDetectionMaterial = new THREE.ShaderMaterial({
      vertexShader: edgeDetectionShaders.vertex,
      fragmentShader: edgeDetectionShaders.fragment,
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
      depthTest: false,
      depthWrite: false
    });
    this._fxaaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: this._compositionTarget.texture },
        resolution: { value: new THREE.Vector2() }
      },
      vertexShader: fxaaShaders.vertex,
      fragmentShader: fxaaShaders.fragment,
      depthTest: false,
      depthWrite: false
    });

    this.setupCompositionScene();
    this.setupFxaaScene();
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
      renderer.info.autoReset = false;
      renderer.info.reset();
      renderer.setClearAlpha(0);

      const { hasBackElements, hasInFrontElements, hasGhostElements } = this.splitToScenes();

      if (hasBackElements && !hasGhostElements) {
        this.renderBackCadModelsFromBaseScene(renderer, camera);
        this.clearTarget(renderer, this._ghostObjectRenderTarget);
      } else if (hasBackElements && hasGhostElements) {
        this.renderBackCadModels(renderer, camera);
        this._backSceneBuilder.restoreOriginalScene();
        this.renderGhostedCadModelsFromBaseScene(renderer, camera);
      } else if (!hasBackElements && hasGhostElements) {
        this.clearTarget(renderer, this._backRenderedCadModelTarget);
        this.renderGhostedCadModelsFromBaseScene(renderer, camera);
      } else {
        this.clearTarget(renderer, this._backRenderedCadModelTarget);
        this.clearTarget(renderer, this._ghostObjectRenderTarget);
      }
      if (hasInFrontElements) {
        this.renderInFrontCadModels(renderer, camera);
        this._inFrontSceneBuilder.restoreOriginalScene();
      } else {
        this.clearTarget(renderer, this._frontRenderedCadModelTarget);
      }
      this.renderCustomObjects(renderer, scene, camera);

      renderer.setClearAlpha(original.clearAlpha);

      // Composite view and anti-aliased version to screen
      this.renderComposition(renderer, camera);
      this.renderAntiAliasToCanvas(renderer);
    } finally {
      // Restore state
      renderer.setClearAlpha(original.clearAlpha);
      renderer.setRenderTarget(original.renderTarget);
      this._materialManager.setRenderMode(original.renderMode);

      this._rootSectorNodeBuffer.forEach(p => {
        p[1].add(p[0]);
      });
      this._rootSectorNodeBuffer.clear();
    }
  }

  private clearTarget(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget) {
    renderer.setRenderTarget(target);
    renderer.clear(true, true, false); // Clear color and depth
  }

  private splitToScenes(): { hasBackElements: boolean; hasInFrontElements: boolean; hasGhostElements: boolean } {
    const result = { hasBackElements: false, hasInFrontElements: false, hasGhostElements: false };
    this._rootSectorNodeBuffer.forEach(rootSectorNodeData => {
      const cadNode: CadNode = rootSectorNodeData[1];
      const root: RootSectorNode = rootSectorNodeData[0];

      const backSet = this._materialManager.getModelBackTreeIndices(cadNode.cadModelMetadata.blobUrl);
      const infrontSet = this._materialManager.getModelInFrontTreeIndices(cadNode.cadModelMetadata.blobUrl);
      const ghostSet = this._materialManager.getModelGhostedTreeIndices(cadNode.cadModelMetadata.blobUrl);
      const hasBackElements = backSet.size > 0;
      const hasInFrontElements = infrontSet.size > 0;
      const hasGhostElements = ghostSet.size > 0;
      result.hasBackElements = result.hasBackElements || hasBackElements;
      result.hasInFrontElements = result.hasInFrontElements || hasInFrontElements;
      result.hasGhostElements = result.hasGhostElements || hasGhostElements;

      const backRoot = new THREE.Object3D();
      backRoot.applyMatrix4(root.matrix);
      if (hasBackElements && hasGhostElements) {
        this._backScene.add(backRoot);
      }

      const infrontRoot = new THREE.Object3D();
      infrontRoot.applyMatrix4(root.matrix);
      if (hasInFrontElements) {
        this._inFrontScene.add(infrontRoot);
      }

      const objectStack: THREE.Object3D[] = [rootSectorNodeData[0]];
      while (objectStack.length > 0) {
        const element = objectStack.pop()!;
        const objectTreeIndices = element.userData.treeIndices as Set<number> | undefined;

        if (objectTreeIndices) {
          if (hasInFrontElements && hasIntersection(infrontSet, objectTreeIndices)) {
            this._inFrontSceneBuilder.addElement(element, infrontRoot);
          }
          // Note! When we don't have any ghost, we use _cadScene to hold back objects, so no action required
          if (hasBackElements && !hasGhostElements) {
          } else if (hasGhostElements && hasIntersection(backSet, objectTreeIndices)) {
            this._backSceneBuilder.addElement(element, backRoot);
            // Use _cadScene to hold ghost objects (we assume we have more ghost objects than back objects)
          }

          // TODO 2020-09-18 larsmoa: A potential optimization to rendering is to avoid rendering the full
          // set of objects if most are hidden.
        } else {
          // Not a leaf, traverse children
          objectStack.push(...element.children);
        }
      }
    });

    return result;
  }

  private renderBackCadModels(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    this._backSceneBuilder.populateTemporaryScene();
    renderer.setRenderTarget(this._backRenderedCadModelTarget);
    this._materialManager.setRenderMode(RenderMode.Color);
    renderer.render(this._backScene, camera);
  }

  private renderBackCadModelsFromBaseScene(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    renderer.setRenderTarget(this._backRenderedCadModelTarget);
    this._materialManager.setRenderMode(RenderMode.Color);
    renderer.render(this._cadScene, camera);
  }

  private renderInFrontCadModels(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    this._inFrontSceneBuilder.populateTemporaryScene();
    renderer.setRenderTarget(this._frontRenderedCadModelTarget);
    this._materialManager.setRenderMode(RenderMode.Effects);
    renderer.render(this._inFrontScene, camera);
  }

  private renderGhostedCadModelsFromBaseScene(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    renderer.setRenderTarget(this._ghostObjectRenderTarget);
    this._materialManager.setRenderMode(RenderMode.Ghost);
    renderer.render(this._cadScene, camera);
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
      this._compositionTarget.setSize(renderSize.x, renderSize.y);

      this._combineEdgeDetectionMaterial.setValues({
        uniforms: {
          ...this._combineEdgeDetectionMaterial.uniforms,
          texelSize: {
            value: new THREE.Vector2(this.outlineTexelSize / renderSize.x, this.outlineTexelSize / renderSize.y)
          }
        }
      });

      this._fxaaMaterial.setValues({
        uniforms: {
          ...this._fxaaMaterial.uniforms,
          resolution: { value: renderSize }
        }
      });
    }
    return renderSize;
  }

  private renderComposition(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    this._combineEdgeDetectionMaterial.uniforms.cameraNear.value = camera.near;
    this._combineEdgeDetectionMaterial.uniforms.cameraFar.value = camera.far;

    renderer.setRenderTarget(this._compositionTarget);
    renderer.render(this._compositionScene, this._orthographicCamera);
  }

  private renderAntiAliasToCanvas(renderer: THREE.WebGLRenderer) {
    renderer.setRenderTarget(null);
    renderer.render(this._fxaaScene, this._orthographicCamera);
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

  private setupCompositionScene() {
    const geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-1, -1, 0));
    geometry.vertices.push(new THREE.Vector3(3, -1, 0));
    geometry.vertices.push(new THREE.Vector3(-1, 3, 0));

    const face = new THREE.Face3(0, 1, 2);
    geometry.faces.push(face);

    geometry.faceVertexUvs[0].push([new THREE.Vector2(0, 0), new THREE.Vector2(2, 0), new THREE.Vector2(0, 2)]);

    const mesh = new THREE.Mesh(geometry, this._combineEdgeDetectionMaterial);

    this._compositionScene.add(mesh);
  }

  private setupFxaaScene() {
    const geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-1, -1, 0));
    geometry.vertices.push(new THREE.Vector3(3, -1, 0));
    geometry.vertices.push(new THREE.Vector3(-1, 3, 0));

    const face = new THREE.Face3(0, 1, 2);
    geometry.faces.push(face);

    geometry.faceVertexUvs[0].push([new THREE.Vector2(0, 0), new THREE.Vector2(2, 0), new THREE.Vector2(0, 2)]);

    const mesh = new THREE.Mesh(geometry, this._fxaaMaterial);

    this._fxaaScene.add(mesh);
  }

  private traverseForRootSectorNode(root: THREE.Object3D) {
    const objectStack = [root];

    while (objectStack.length > 0) {
      const element = objectStack.pop()!;
      if (element instanceof RootSectorNode) {
        this._rootSectorNodeBuffer.add([element, element.parent! as CadNode]);
      } else if (!(element instanceof THREE.Group)) {
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
  // Can we improve performance by using a bloom filter before comparing full sets?
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

/**
 * Holds parent-child relationship for a ThreeJS element in order to restore
 * the relationship after moving it temporarily.
 */
type Object3DStructure = {
  /**
   * Element described.
   */
  object: THREE.Object3D;
  /**
   * The previous parent of the element.
   */
  parent: THREE.Object3D;
  /**
   * The object that temporarily holds the elemnt.
   */
  sceneParent: THREE.Object3D;
};

class TemporarySceneBuilder {
  private readonly buffer: Object3DStructure[];
  private readonly temporaryScene: THREE.Scene;

  constructor(temporaryScene: THREE.Scene) {
    this.buffer = [];
    this.temporaryScene = temporaryScene;
  }

  addElement(element: THREE.Object3D, temporaryModelRootElement: THREE.Object3D): void {
    this.buffer.push({ object: element, parent: element.parent!, sceneParent: temporaryModelRootElement });
  }

  populateTemporaryScene(): void {
    this.buffer.forEach(x => x.sceneParent.add(x.object));
  }

  restoreOriginalScene(): void {
    this.buffer.forEach(p => {
      p.parent.add(p.object);
    });
    this.buffer.length = 0; // clear
    this.temporaryScene.remove(...this.temporaryScene.children);
  }
}
