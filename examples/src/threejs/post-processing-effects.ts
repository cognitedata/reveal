/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import * as reveal from '@cognite/reveal';
import { CadNode } from '@cognite/reveal/threejs';
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
  SSAOEffect
} = postprocessing;

CameraControls.install({ THREE });

class RevealNormalPass extends Pass {
  renderTarget: THREE.WebGLRenderTarget;
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderToScreen: boolean;
  private _renderPass: any; // RenderPass

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    params?: {
      renderTarget?: THREE.WebGLRenderTarget;
    }
  ) {
    super('RevealNormalPass');

    // @ts-ignore
    this.needsSwap = false;

    this.renderToScreen = false;

    this.scene = scene;
    this.camera = camera;

    if (!params || !params.renderTarget) {
      this.renderTarget = new THREE.WebGLRenderTarget(1920, 1920, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat,
        stencilBuffer: false
      });

      this.renderTarget.texture.name = 'RevealNormalPass.Target';
    } else {
      this.renderTarget = params.renderTarget;
    }
  }

  render(renderer: THREE.WebGLRenderer) {
    const { renderTarget, scene, camera } = this;

    const previousClearAlpha = renderer.getClearAlpha();
    const previousClearColor = renderer.getClearColor().clone();

    renderer.setClearColor(new THREE.Color(0x7777ff), 1.0);

    renderer.setRenderTarget(this.renderToScreen ? null : renderTarget);
    renderer.clear(true, false, false);
    renderer.render(scene, camera);

    renderer.setClearColor(previousClearColor);
    renderer.setClearAlpha(previousClearAlpha);
  }
}

async function main() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#000000');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const cadModel = await reveal.createLocalCadModel('/primitives');
  const cadModelNode = new CadNode(cadModel);
  scene.add(cadModelNode);

  const controls = new CameraControls(camera, renderer.domElement);
  const pos = new THREE.Vector3(10, 10, 10);
  const target = new THREE.Vector3(5, 5, 5);
  controls.setLookAt(pos.x, pos.y, pos.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();

  const renderPass = new RenderPass(scene, camera);
  const normalPass = new RevealNormalPass(scene, camera);
  const composer = new EffectComposer(renderer);

  const ssaoEffect = new SSAOEffect(camera, normalPass.renderTarget.texture, {
    blendFunction: BlendFunction.MULTIPLY,
    samples: 11,
    rings: 4,
    distanceThreshold: 0.3, // Render up to a distance of ~300 world units
    distanceFalloff: 0.02, // with an additional 20 units of falloff.
    rangeThreshold: 0.001,
    rangeFalloff: 0.001,
    luminanceInfluence: 0.7,
    radius: 18.25,
    scale: 1.0,
    bias: 0.05
  });
  const effectPass = new EffectPass(camera, ssaoEffect);
  effectPass.renderToScreen = true;

  composer.addPass(renderPass);
  composer.addPass(normalPass);

  if (true) {
    normalPass.renderToScreen = true;
  } else {
    composer.addPass(effectPass);
  }

  const clock = new THREE.Clock();
  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    const modelNeedsUpdate = await cadModelNode.update(camera);
    const needsUpdate = controlsNeedUpdate || modelNeedsUpdate;

    // renderer.render(scene, camera);
    composer.render(clock.getDelta());

    // if (needsUpdate) {
    // effectComposer.render(delta);
    // }
    requestAnimationFrame(render);
  };
  render();

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
}

main();
