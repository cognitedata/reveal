/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import CameraControls from 'camera-controls';
import { getParamsFromURL, createRenderManager } from './utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import { RevealManager, CadNode, RenderManager, LocalHostRevealManager } from '@cognite/reveal';

const postprocessing = require('postprocessing');

CameraControls.install({ THREE });

async function main() {
  const { project, modelUrl, modelRevision } = getParamsFromURL({ project: 'publicdata', modelUrl: 'primitives' });
  const client = new CogniteClient({ appId: 'reveal.example.post-processing' });
  client.loginWithOAuth({ project });

  const scene = new THREE.Scene();
  const revealManager: RenderManager = createRenderManager(modelRevision !== undefined ? 'cdf' : 'local', client);

  let model: CadNode;
  if (revealManager instanceof LocalHostRevealManager && modelUrl !== undefined) {
    model = await revealManager.addModel('cad', modelUrl);
  } else if (revealManager instanceof RevealManager && modelRevision !== undefined) {
    model = await revealManager.addModel('cad', modelRevision);
  } else {
    throw new Error('Need to provide either project & model OR modelUrl as query parameters');
  }
  scene.add(model);

  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const { position, target, near, far } = model.suggestCameraConfig();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far);
  const controls = new CameraControls(camera, renderer.domElement);
  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();
  revealManager.update(camera);

  // See https://vanruesc.github.io/postprocessing/public/docs/identifiers.html
  const effectPass = new postprocessing.EffectPass(camera, new postprocessing.DotScreenEffect());
  effectPass.renderToScreen = true;
  const effectComposer = new postprocessing.EffectComposer(renderer);
  effectComposer.addPass(new postprocessing.RenderPass(scene, camera));
  effectComposer.addPass(effectPass);

  const clock = new THREE.Clock();
  const render = () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    if (controlsNeedUpdate) {
      revealManager.update(camera);
    }

    const needsUpdate = controlsNeedUpdate || revealManager.needsRedraw;
    if (needsUpdate) {
      effectComposer.render(delta);
      revealManager.resetRedraw();
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
