/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { CadNode, RevealManager } from '@cognite/reveal';
import { SsaoEffect, SsaoPassType } from '@cognite/reveal/utilities';
import dat from 'dat.gui';
import { getParamsFromURL } from './utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';

CameraControls.install({ THREE });

async function main() {
  const { project, modelUrl, modelRevision } = getParamsFromURL({ project: 'publicdata', modelUrl: 'primitives' });
  const client = new CogniteClient({ appId: 'reveal.example.ssao' });
  client.loginWithOAuth({ project });

  const scene = new THREE.Scene();
  let modelsNeedUpdate = true;
  const revealManager = new RevealManager(client, () => {
    modelsNeedUpdate = true;
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

  const effect = new SsaoEffect();
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

  let effectNeedsUpdate = false;
  const updateEffect = () => {
    effectNeedsUpdate = true;
  };

  const renderSettings = {
    pass: SsaoPassType.Antialias
  };

  const gui = new dat.GUI();
  gui
    .add(renderSettings, 'pass', {
      Regular: SsaoPassType.Regular,
      Ssao: SsaoPassType.Ssao,
      SsaoFinal: SsaoPassType.SsaoFinal,
      Antialias: SsaoPassType.Antialias
    })
    .onChange(updateEffect);

  gui
    .add(effect, 'kernelRadius')
    .min(0.1)
    .max(30.0)
    .onChange(updateEffect);

  gui
    .add(effect, 'minDistance')
    .min(0.0)
    .max(0.001)
    .onChange(updateEffect);

  gui
    .add(effect, 'maxDistance')
    .min(0.0)
    .max(0.2)
    .onChange(updateEffect);

  const render = () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    if (controlsNeedUpdate) {
      revealManager.update(camera);
    }

    if (controlsNeedUpdate || modelsNeedUpdate || effectNeedsUpdate) {
      effect.render(renderer, scene, camera, renderSettings.pass);
      effectNeedsUpdate = false;
    }

    requestAnimationFrame(render);
  };
  render();
}

main();
