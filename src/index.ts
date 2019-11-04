/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { WellKnownModels } from './examples/models';
import { CogniteClient } from '@cognite/sdk';
import CameraControls from 'camera-controls';
import { vec3 } from 'gl-matrix';
import { createLocalSectorModel } from './datasources/local/createLocalSectorModel';
import createThreeJsSectorNode from './views/threejs/createThreeJsSectorNode';

const postprocessing = require('postprocessing');
const RendererStats = require('@xailabs/three-renderer-stats');

CameraControls.install({ THREE });

async function main() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.near = 0.12;
  camera.far = 1000;
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#000000');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const model = WellKnownModels.Cellar3D;
  const sdk = new CogniteClient({ appId: 'reveal-streaming' });
  await sdk.loginWithOAuth({
    project: model.project, // project you want to login to (can be skipped if you have configured the project with 'configure')
    onAuthenticate: login => {
      login.redirect({
        redirectUrl: window.location.href, // where you want the user to end up after successful login
        errorRedirectUrl: window.location.href // where you want the user to end up after failed login
      });
    }
  });

  const sectorModel = createLocalSectorModel('/***REMOVED***');
  const sectorModelNode = await createThreeJsSectorNode(sectorModel);
  scene.add(sectorModelNode);

  const controls = new CameraControls(camera, renderer.domElement);
  const pos = vec3.fromValues(373.2188407437061, 512.6270615748768, -126.18227676536418);
  const target = vec3.fromValues(330.697021484375, 500.3190002441406, -84.89916229248047);
  controls.setLookAt(pos[0], pos[1], pos[2], target[0], target[1], target[2]);
  controls.update(0.0);
  camera.updateMatrixWorld();

  // let sectorsLocked = false;
  // async function triggerUpdate() {
  //   if (!sectorsLocked) {
  //     const wantedSectorIds = await determineSectors(sectorRoot, camera, modelTranformation);
  //     activateDetailedSectors(wantedSectorIds.detailed);
  //     activateSimpleSectors(wantedSectorIds.simple);
  //   }
  // }
  // controls.addEventListener('update', async () => {
  //   await triggerUpdate();
  // });
  // triggerUpdate();

  // document.addEventListener('keypress', event => {
  //   if (event.key === 'l') {
  //     sectorsLocked = !sectorsLocked;
  //     if (sectorsLocked) {
  //       console.log(`Sectors locked - will not load new sectors.`);
  //     } else {
  //       console.log(`Sectors unlocked - loading new sectors when view updates.`);
  //       triggerUpdate();
  //     }
  //   }
  // });
  const rendererStats = createRendererStats();

  const clock = new THREE.Clock();
  const render = () => {
    requestAnimationFrame(render);

    const delta = clock.getDelta();
    const needsUpdate = controls.update(delta) || sectorModelNode.needsRedraw;

    if (needsUpdate) {
      renderer.render(scene, camera);
      rendererStats.update(renderer);
      sectorModelNode.needsRedraw = false;
    }
  };
  render();

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
}

main();

// Typedefinition for RenderStats
interface RenderStats {
  update(renderer: THREE.WebGLRenderer): void;
}

function createRendererStats(): RenderStats {
  const rendererStats = new RendererStats();
  rendererStats.domElement.style.position = 'absolute';
  rendererStats.domElement.style.left = '10px';
  rendererStats.domElement.style.bottom = '10px';
  rendererStats.domElement.style.zoom = '150%';
  document.body.appendChild(rendererStats.domElement);
  return rendererStats;
}
