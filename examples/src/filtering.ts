/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { CadNode, RevealManager, ModelNodeAppearance } from '@cognite/reveal/experimental';
import dat from 'dat.gui';
import { getParamsFromURL } from './utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';

CameraControls.install({ THREE });

async function main() {
  const { project, modelUrl, modelRevision } = getParamsFromURL({ project: 'publicdata', modelUrl: 'primitives' });
  const client = new CogniteClient({ appId: 'reveal.example.filtering' });
  client.loginWithOAuth({ project });

  const scene = new THREE.Scene();
  let shadingNeedsUpdate = false;
  let visibleIndices = new Set([1, 2, 8, 12]);
  const settings = {
    treeIndices: '1, 2, 8, 12'
  };
  let modelsNeedUpdate = true;
  const revealManager = new RevealManager(client, () => {
    modelsNeedUpdate = true;
  });
  let model: CadNode;
  const nodeAppearance: ModelNodeAppearance = {
    visible(treeIndex: number) {
      return visibleIndices.has(treeIndex);
    }
  };
  if (modelUrl) {
    model = await revealManager.addModelFromUrl(modelUrl, nodeAppearance);
  } else if (modelRevision) {
    model = await revealManager.addModelFromCdf(modelRevision, nodeAppearance);
  } else {
    throw new Error('Need to provide either project & model OR modelUrl as query parameters');
  }
  scene.add(model);

  const gui = new dat.GUI();
  gui.add(settings, 'treeIndices').onChange(() => {
    const indices = settings.treeIndices
      .split(',')
      .map(s => s.trim())
      .map(i => parseInt(i, 10))
      .filter(x => !isNaN(x));

    const oldIndices = visibleIndices;
    visibleIndices = new Set(indices);
    model.requestNodeUpdate([...oldIndices]);
    model.requestNodeUpdate([...visibleIndices]);
    shadingNeedsUpdate = true;
  });

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
  const clock = new THREE.Clock();
  const render = () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    if (controlsNeedUpdate) {
      revealManager.update(camera);
    }

    if (controlsNeedUpdate || modelsNeedUpdate || shadingNeedsUpdate) {
      renderer.render(scene, camera);
      shadingNeedsUpdate = false;
    }

    requestAnimationFrame(render);
  };
  render();

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
  (window as any).renderer = renderer;
}

main();
