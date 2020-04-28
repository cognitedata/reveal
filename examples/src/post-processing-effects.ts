/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import * as reveal_threejs from '@cognite/reveal/threejs';

import CameraControls from 'camera-controls';
import { loadCadModelFromCdfOrUrl, createModelIdentifierFromUrlParams, createClientIfNecessary } from './utils/loaders';
import { getParamsFromURL } from './utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import { SimpleRevealManager, CadNode } from '@cognite/reveal/threejs';

const postprocessing = require('postprocessing');

CameraControls.install({ THREE });

async function main() {
  const { project, modelUrl, modelRevision } = getParamsFromURL({ project: 'publicdata', modelUrl: 'ivar-aasen' });
  const client = new CogniteClient({ appId: 'reveal.example.post-processing' });
  client.loginWithOAuth({ project });

  const scene = new THREE.Scene();
  let sectorsNeedUpdate = true;
  const revealManager = new SimpleRevealManager(client, () => {
    sectorsNeedUpdate = true;
  });
  let model: CadNode;
  if (modelUrl) {
    model = await revealManager.addModelFromUrl(modelUrl);
  } else if (modelRevision) {
    model = await revealManager.addModelFromCdf(modelRevision);
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

    const needsUpdate = controlsNeedUpdate || sectorsNeedUpdate;
    if (needsUpdate) {
      effectComposer.render(delta);
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
