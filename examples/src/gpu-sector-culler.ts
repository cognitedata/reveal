/*!
 * Copyright 2020 Cognite AS
 */

// tslint:disable no-console

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import * as reveal_threejs from '@cognite/reveal/threejs';
import * as reveal from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';
import { getParamsFromURL } from './utils/example-helpers';
import { CadNode } from '@cognite/reveal/threejs';

CameraControls.install({ THREE });

async function main() {
  const { project, modelUrl, modelRevision } = getParamsFromURL({ project: 'publicdata', modelUrl: 'primitives' });
  const client = new CogniteClient({ appId: 'reveal.example.simple' });
  client.loginWithOAuth({ project });

  const scene = new THREE.Scene();
  let modelsNeedUpdate = true;

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
  const coverageUtil = new reveal_threejs.GpuOrderSectorsByVisibilityCoverage();
  const sectorCuller = new reveal.internal.ByVisibilityGpuSectorCuller(camera, {
    coverageUtil,
    costLimit: 70 * 1024 * 1024,
    logCallback: console.log
  });
  const revealManager = new reveal_threejs.SimpleRevealManager(
    client,
    () => {
      modelsNeedUpdate = true;
    },
    { internal: { sectorCuller } }
  );
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
  camera.near = near;
  camera.far = far;
  const controls = new CameraControls(camera, renderer.domElement);
  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();
  revealManager.update(camera);
  const clock = new THREE.Clock();

  // revealManager.renderHints = { showSectorBoundingBoxes: false }; Not yet supported.
  // Debug overlay for "determineSectors"

  const canvas = coverageUtil.createDebugCanvas({ width: 160, height: 100 });
  canvas.style.position = 'fixed';
  canvas.style.left = '8px';
  canvas.style.top = '8px';
  document.body.appendChild(canvas);
  document.body.appendChild(renderer.domElement);

  // document.addEventListener('keypress', event => {
  //   if (event.key === 's') {
  //     const suspendLoading = !cadNode.loadingHints.suspendLoading;
  //     console.log(`Suspend loading: ${suspendLoading}`);
  //     cadNode.loadingHints = { ...cadNode.loadingHints, suspendLoading };
  //   } else if (event.key === 'b') {
  //     const showSectorBoundingBoxes = !cadNode.renderHints.showSectorBoundingBoxes;
  //     console.log(`Show sector bounds: ${showSectorBoundingBoxes}`);
  //     cadNode.renderHints = { ...cadNode.renderHints, showSectorBoundingBoxes };
  //   } else if (event.key === 'p') {
  //     const lastWanted = sectorCuller.lastWantedSectors
  //       .filter(x => x.levelOfDetail !== reveal.internal.LevelOfDetail.Discarded)
  //       .sort((l, r) => {
  //         if (l.scene.maxTreeIndex !== r.scene.maxTreeIndex) {
  //           return l.scene.maxTreeIndex - r.scene.maxTreeIndex;
  //         } else if (l.metadata.path !== r.metadata.path) {
  //           return l.metadata.path.localeCompare(r.metadata.path);
  //         } else if (l.priority !== r.priority) {
  //           return l.priority - r.priority;
  //         }
  //         return l.levelOfDetail - r.levelOfDetail;
  //       });

  //     console.log('Last list of wanted sectors:\n', lastWanted);
  //     const paths = lastWanted
  //       .map((x: PrioritizedWantedSector) => `${x.metadata.path} [lod=${x.levelOfDetail}, id=${x.metadata.id}]`)
  //       .sort();
  //     console.log('Paths:', paths);
  //   }
  // });

  revealManager.update(camera);
  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    if (controlsNeedUpdate) {
      revealManager.update(camera);
    }

    if (controlsNeedUpdate || modelsNeedUpdate) {
      renderer.render(scene, camera);
      modelsNeedUpdate = false;
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
