/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import * as reveal from '@cognite/reveal';
import { CadNode, internal } from '@cognite/reveal/threejs';
import CameraControls from 'camera-controls';

const postprocessing = require('postprocessing');
const {
  BloomEffect,
  EffectComposer,
  NormalPass,
  DepthEffect,
  RenderPass,
  BlendFunction,
  EffectPass,
  Pass,
  SSAOEffect,
  Resizer
} = postprocessing;

CameraControls.install({ THREE });

function traverseShaderMaterials(rootNode: THREE.Object3D, callback: (material: THREE.ShaderMaterial) => void) {
  rootNode.traverseVisible(obj => {
    // NOTE we cannot rely on instanceof here because THREE is not necessarily the same library
    if (obj.type !== 'Mesh') {
      return;
    }
    const mesh = obj as THREE.Mesh;
    if (mesh.material == null || Array.isArray(mesh.material) || mesh.material.type !== 'ShaderMaterial') {
      return;
    }
    const material = mesh.material as THREE.ShaderMaterial;

    callback(material);
  });
}

class RevealNormalPass extends Pass {
  renderTarget: THREE.WebGLRenderTarget;
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderToScreen: boolean;
  private _resolution: any;
  private _renderPass: any; // RenderPass

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    super('RevealNormalPass');

    // @ts-ignore
    this.needsSwap = false;

    this.renderToScreen = false;

    this.scene = scene;
    this.camera = camera;

    this.renderTarget = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
      stencilBuffer: false
    });

    this.renderTarget.texture.name = 'RevealNormalPass.Target';

    this._resolution = new Resizer(this, Resizer.AUTO_SIZE, Resizer.AUTO_SIZE);
    this._resolution.scale = 1.0;
  }

  setResolutionScale(scale: number) {
    this._resolution.scale = scale;
    this.setSize(this.originalSize.x, this.originalSize.y);
  }

  setSize(width: number, height: number) {
    const resolution = this._resolution;
    resolution.base.set(width, height);

    width = resolution.width;
    height = resolution.height;

    this.renderTarget.setSize(width, height);
  }

  render(renderer: THREE.WebGLRenderer) {
    const { renderTarget, scene, camera } = this;

    const previousClearAlpha = renderer.getClearAlpha();
    const previousClearColor = renderer.getClearColor().clone();

    traverseShaderMaterials(this.scene.children[0], material => {
      material.uniforms.renderType = { value: internal.materials.RenderType.Normal };
    });

    renderer.setClearColor(new THREE.Color(0x7777ff), 1.0);
    renderer.setRenderTarget(this.renderToScreen ? null : renderTarget);
    renderer.clear(true, true, false);
    renderer.render(scene, camera);

    renderer.setClearColor(previousClearColor);
    renderer.setClearAlpha(previousClearAlpha);

    traverseShaderMaterials(this.scene.children[0], material => {
      material.uniforms.renderType = { value: internal.materials.RenderType.Color };
    });
  }
}

async function main() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#000000');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const modelUrl = new URL(location.href).searchParams.get('model') || '/primitives';
  const cadModel = await reveal.createLocalCadModel(modelUrl);
  const cadModelNode = new CadNode(cadModel);
  scene.add(cadModelNode);

  const { position, target, near, far } = cadModelNode.suggestCameraConfig();
  const controls = new CameraControls(camera, renderer.domElement);
  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();

  const renderPass = new RenderPass(scene, camera);
  const normalPass = new RevealNormalPass(scene, camera);
  const composer = new EffectComposer(renderer);

  const ssaoEffect = new SSAOEffect(camera, normalPass.renderTarget.texture, {
    blendFunction: BlendFunction.MULTIPLY,
    samples: 16,
    rings: 4,
    distanceThreshold: 0.8, // Render up to a distance of ~300 world units
    distanceFalloff: 0.2, // with an additional 20 units of falloff.
    rangeThreshold: 0.05,
    rangeFalloff: 0.01,
    luminanceInfluence: 0.8,
    radius: 18.25,
    scale: 0.45,
    bias: 0.3
  });
  const effectPass = new EffectPass(camera, ssaoEffect);

  if (false) {
    normalPass.renderToScreen = true;
    composer.addPass(normalPass);
  } else {
    renderPass.renderToScreen = false;
    effectPass.renderToScreen = true;

    composer.addPass(renderPass);
    composer.addPass(normalPass);
    composer.addPass(effectPass);
  }

  const clock = new THREE.Clock();
  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    const modelNeedsUpdate = await cadModelNode.update(camera);
    const needsUpdate = controlsNeedUpdate || modelNeedsUpdate;

    if (needsUpdate) {
      composer.render(delta);
    }
    requestAnimationFrame(render);
  };
  render();

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
}

main();
