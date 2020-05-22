/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import CameraControls from 'camera-controls';
import { getParamsFromURL, createRenderManager } from './utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import { RevealManager, CadNode, RenderManager, LocalHostRevealManager } from '@cognite/reveal';

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
  const { project, modelUrl, modelRevision } = getParamsFromURL({ project: 'publicdata', modelUrl: 'primitives' });
  const { modelUrl2, modelRevision2 } = getModel2Params();
  const client = new CogniteClient({ appId: 'reveal.example.two-models' });
  client.loginWithOAuth({ project });

  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

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
  let model2: CadNode;
  if (revealManager instanceof LocalHostRevealManager && modelUrl2 !== undefined) {
    model2 = await revealManager.addModel('cad', modelUrl2);
  } else if (revealManager instanceof RevealManager && modelRevision2 !== undefined) {
    model2 = await revealManager.addModel('cad', modelRevision2);
  } else {
    throw new Error('Need to provide either project & model2 OR modelUrl2 as query parameters');
  }
  scene.add(model2);

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
    const needsUpdate = controlsNeedUpdate || revealManager.needsRedraw;

    if (needsUpdate) {
      renderer.render(scene, camera);
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
