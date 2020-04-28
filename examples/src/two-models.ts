/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import CameraControls from 'camera-controls';
import { getParamsFromURL } from './utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import { SimpleRevealManager, CadNode } from '@cognite/reveal/threejs';

CameraControls.install({ THREE });

function getModel2Params() {
  const url = new URL(location.href);
  const searchParams = url.searchParams;
  const modelRevision2 = searchParams.get('model2');
  const modelUrl2 = searchParams.get('modelUrl2');
  return {
    modelRevision2: modelRevision2 ? Number.parseInt(modelRevision2, 10) : undefined,
    modelUrl2: modelUrl2 ? location.origin + '/' + modelUrl2 : undefined
  };
}

async function main() {
  const { project, modelUrl, modelRevision } = getParamsFromURL({ project: 'publicdata', modelUrl: 'ivar-aasen' });
  const { modelUrl2, modelRevision2 } = getModel2Params();
  const client = new CogniteClient({ appId: 'reveal.example.two-models' });
  client.loginWithOAuth({ project });

  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

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
  let model2: CadNode;
  if (modelUrl2) {
    model2 = await revealManager.addModelFromUrl(modelUrl2);
  } else if (modelRevision2) {
    model2 = await revealManager.addModelFromCdf(modelRevision2);
  } else {
    throw new Error('Need to provide either model2 OR modelUrl2 as an additional query parameters');
  }

  const { position, target, near, far } = model.suggestCameraConfig();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far);
  const controls = new CameraControls(camera, renderer.domElement);
  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();
  revealManager.update(camera);

  const model2Offset = new THREE.Group();
  model2Offset.position.set(-2, -2, 0);
  model2Offset.add(model2);
  scene.add(model);
  scene.add(model2Offset);

  revealManager.update(camera);

  const clock = new THREE.Clock();
  const render = () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    if (controlsNeedUpdate) {
      revealManager.update(camera);
    }
    const needsUpdate = controlsNeedUpdate || sectorsNeedUpdate;

    if (needsUpdate) {
      renderer.render(scene, camera);
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
