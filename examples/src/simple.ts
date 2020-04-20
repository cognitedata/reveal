/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { loadCadModelFromCdfOrUrl, createModelIdentifierFromUrlParams, createClientIfNecessary } from './utils/loaders';
import * as reveal_threejs from '@cognite/reveal/threejs';
import * as reveal from '@cognite/reveal';

CameraControls.install({ THREE });

async function main() {
  const urlParams = new URL(location.href).searchParams;
  const modelIdentifier = createModelIdentifierFromUrlParams(urlParams, '/primitives');

  const camera = new THREE.PerspectiveCamera();
  const coverageUtil = new reveal_threejs.GpuOrderSectorsByVisibleCoverage();
  const sectorCuller = new reveal.internal.ByVisibilityGpuSectorCuller(camera, { coverageUtil, costLimitMb: 150 });

  const scene = new THREE.Scene();
  const cadModel = await loadCadModelFromCdfOrUrl(modelIdentifier, await createClientIfNecessary(modelIdentifier));
  sectorCuller.addModel(cadModel);
  const cadNode = new reveal_threejs.CadNode(cadModel, { internal: { sectorCuller } });
  cadNode.renderHints = { showSectorBoundingBoxes: true };
  let sectorsNeedUpdate = true;
  cadNode.addEventListener('update', () => {
    sectorsNeedUpdate = true;
  });

  scene.add(cadNode);

  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Debug overlay for "determineSectors"
  const canvas = coverageUtil.createDebugCanvas({ width: 160, height: 100 });
  canvas.style.position = 'fixed';
  canvas.style.left = '8px';
  canvas.style.top = '8px';
  document.body.appendChild(canvas);
  document.body.appendChild(renderer.domElement);

  const { position, target, near, far } = cadNode.suggestCameraConfig();
  camera.near = near;
  camera.far = 3 * far;
  camera.fov = 75;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();

  document.addEventListener('keypress', event => {
    if (event.key === 's') {
      const suspendLoading = !cadNode.loadingHints.suspendLoading;
      console.log(`Suspend loading: ${suspendLoading}`);
      cadNode.loadingHints = { ...cadNode.loadingHints, suspendLoading };
    } else if (event.key === 'b') {
      const showSectorBoundingBoxes = !cadNode.renderHints.showSectorBoundingBoxes;
      console.log(`Show sector bounds: ${showSectorBoundingBoxes}`);
      cadNode.renderHints = { ...cadNode.renderHints, showSectorBoundingBoxes };
    } else if (event.key === 'p') {
      const lastWanted = sectorCuller.lastWantedSectors.sort((l, r) => {
        if (l.scene.maxTreeIndex !== r.scene.maxTreeIndex) {
          return l.scene.maxTreeIndex - r.scene.maxTreeIndex;
        } else if (l.metadata.path !== r.metadata.path) {
          return l.metadata.path.localeCompare(r.metadata.path);
        } else if (l.priority !== r.priority) {
          return l.priority - r.priority;
        }
        return l.levelOfDetail - r.levelOfDetail;
      });
      const duplicateCount = lastWanted.reduce((count, x, i) => {
        if (i === 0 || (lastWanted[i - 1].sectorId === x.sectorId && lastWanted[i - 1].scene === x.scene)) {
          return count + 1;
        }
        return count;
      }, 0);
      console.log('Last list of wanted sectors:\n', lastWanted);
      console.log(`Duplicate count: ${duplicateCount}`);
    }
  });

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
