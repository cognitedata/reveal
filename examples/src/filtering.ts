/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { CadNode, NodeAppearance } from '@cognite/reveal/threejs';
import dat from 'dat.gui';
import { loadCadModelFromCdfOrUrl, createModelIdentifierFromUrlParams } from './utils/loaders';

CameraControls.install({ THREE });

async function main() {
  const urlParams = new URL(location.href).searchParams;
  const modelId = createModelIdentifierFromUrlParams(urlParams, '/primitives');

  let shadingNeedsUpdate = false;
  let visibleIndices = new Set([1, 2, 8, 12]);
  const settings = {
    treeIndices: '1, 2, 8, 12'
  };

  const nodeAppearance: NodeAppearance = {
    visible(treeIndex: number) {
      return visibleIndices.has(treeIndex);
    }
  };

  const scene = new THREE.Scene();
  const cadModel = await loadCadModelFromCdfOrUrl(modelId);
  const cadNode = new CadNode(cadModel, { nodeAppearance });

  const gui = new dat.GUI();
  gui.add(settings, 'treeIndices').onChange(() => {
    const indices = settings.treeIndices
      .split(',')
      .map(s => s.trim())
      .map(i => parseInt(i, 10))
      .filter(x => !isNaN(x));

    const oldIndices = visibleIndices;
    visibleIndices = new Set(indices);
    cadNode.requestNodeUpdate([...oldIndices]);
    cadNode.requestNodeUpdate([...visibleIndices]);
    shadingNeedsUpdate = true;
  });

  scene.add(cadNode);

  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const { position, target, near, far } = cadNode.suggestCameraConfig();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far);
  const controls = new CameraControls(camera, renderer.domElement);
  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();
  const clock = new THREE.Clock();
  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    const sectorsNeedUpdate = await cadNode.update(camera);

    if (controlsNeedUpdate || sectorsNeedUpdate || shadingNeedsUpdate) {
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
