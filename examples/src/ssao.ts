/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { CadNode, SsaoEffect, SsaoPassType } from '@cognite/reveal/threejs';
import dat from 'dat.gui';
import { loadCadModelFromCdfOrUrl, createModelIdentifierFromUrlParams } from './utils/loaders';

CameraControls.install({ THREE });

async function main() {
  const urlParams = new URL(location.href).searchParams;
  const modelIdentifier = createModelIdentifierFromUrlParams(urlParams, '/primitives');

  const scene = new THREE.Scene();
  const cadModel = await loadCadModelFromCdfOrUrl(modelIdentifier);
  const cadNode = new CadNode(cadModel);

  scene.add(cadNode);

  const renderer = new THREE.WebGLRenderer();
  const effect = new SsaoEffect();
  renderer.setClearColor('#000');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const { position, target, near, far } = cadNode.suggestCameraConfig();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far);
  const controls = new CameraControls(camera, renderer.domElement);
  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();
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

  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    const sectorsNeedUpdate = await cadNode.update(camera);

    if (controlsNeedUpdate || sectorsNeedUpdate || effectNeedsUpdate) {
      effect.render(renderer, scene, camera, renderSettings.pass);
      effectNeedsUpdate = false;
    }

    requestAnimationFrame(render);
  };
  render();
}

main();
