/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { loadCadModelFromCdfOrUrl, createModelIdentifierFromUrlParams, createClientIfNecessary } from './utils/loaders';
import * as reveal_threejs from '@cognite/reveal/threejs';

CameraControls.install({ THREE });

async function main() {
  const urlParams = new URL(location.href).searchParams;
  const modelIdentifier = createModelIdentifierFromUrlParams(urlParams, '/primitives');
  const apiKey = urlParams.get('apiKey');

  const camera = new THREE.PerspectiveCamera();
  const scene = new THREE.Scene();
  const cadModel = await loadCadModelFromCdfOrUrl(
    modelIdentifier,
    await createClientIfNecessary(modelIdentifier, apiKey)
  );
  const cadNode = new reveal_threejs.CadNode(cadModel);
  cadNode.renderHints = { showSectorBoundingBoxes: false };
  let sectorsNeedUpdate = true;
  cadNode.addEventListener('update', () => {
    sectorsNeedUpdate = true;
  });

  scene.add(cadNode);

  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);

  const { position, target, near, far } = cadNode.suggestCameraConfig();
  camera.near = near;
  camera.far = 3 * far;
  camera.fov = 75;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();

  const controls = new CameraControls(camera, renderer.domElement);
  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();
  cadNode.update(camera);
  const clock = new THREE.Clock();
  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    if (controlsNeedUpdate) {
      cadNode.update(camera);
    }

    if (controlsNeedUpdate || sectorsNeedUpdate) {
      renderer.render(scene, camera);
      sectorsNeedUpdate = false;
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
