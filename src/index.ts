/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { determineSectors } from './models/sector/determineSectors';
import { initializeThreeJsView } from './views/threejs/initializeThreeJsView';
import { initializeSectorLoader } from './models/sector/initializeSectorLoader';
import { WellKnownModels } from './example/models';
import { CogniteClient } from '@cognite/sdk';
import CameraControls from 'camera-controls';
import { createParser, createQuadsParser } from './models/sector/parseSectorData';
import { vec3 } from 'gl-matrix';
import { createLocalSectorModel } from './datasources/local/createLocalSectorModel';
import { ConsumeSectorDelegate } from './models/sector/delegates';
import { Sector, SectorQuads } from './models/sector/types';
import { createSyncedConsumeAndDiscard } from './views/createSyncedConsumeAndDiscard';

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

  let newDataAvailable = false;
  // const [fetchSectorMetadata, fetchSector, fetchCtmFile] = createSectorModel(sdk, model.modelId, model.revisionId);
  const [fetchSectorMetadata, fetchSector, fetchSectorQuads, fetchCtmFile] = createLocalSectorModel(
    '/***REMOVED***'
  );
  const [sectorRoot, modelTranformation] = await fetchSectorMetadata();
  const parseSectorData = await createParser(sectorRoot, fetchSector, fetchCtmFile);
  const parseSectorQuadsData = await createQuadsParser();
  const [rootGroup, discardSector, consumeSector, consumeSectorQuads] = initializeThreeJsView(
    sectorRoot,
    modelTranformation
  );
  const consumeSectorAndTriggerRedraw: ConsumeSectorDelegate<Sector> = (sectorId, sector) => {
    consumeSector(sectorId, sector);
    newDataAvailable = true;
  };
  const consumeSectorQuadsAndTriggerRedraw: ConsumeSectorDelegate<SectorQuads> = (sectorId, sector) => {
    consumeSectorQuads(sectorId, sector);
    newDataAvailable = true;
  };

  const [discardSectorFinal, consumeSectorFinal, consumeSectorQuadsFinal] = createSyncedConsumeAndDiscard(
    discardSector,
    consumeSectorAndTriggerRedraw,
    consumeSectorQuadsAndTriggerRedraw
  );

  const activateDetailedSectors = initializeSectorLoader(
    fetchSector,
    parseSectorData,
    discardSectorFinal,
    consumeSectorFinal
  );
  const activateSimpleSectors = initializeSectorLoader(
    fetchSectorQuads,
    parseSectorQuadsData,
    discardSectorFinal,
    consumeSectorQuadsFinal
  );

  const light = new THREE.PointLight(0xffffff, 1, 1000);
  light.position.set(340, 600, -90);
  scene.add(light);
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  scene.add(rootGroup);

  const controls = new CameraControls(camera, renderer.domElement);
  const pos = vec3.transformMat4(
    vec3.create(),
    vec3.fromValues(373.2188407437061, 126.18227676536418, 512.6270615748768),
    modelTranformation.modelMatrix
  );
  const target = vec3.transformMat4(
    vec3.create(),
    vec3.fromValues(330.697021484375, 84.89916229248047, 500.3190002441406),
    modelTranformation.modelMatrix
  );

  controls.setLookAt(pos[0], pos[1], pos[2], target[0], target[1], target[2]);
  controls.update(0.0);
  camera.updateMatrixWorld();

  let sectorsLocked = false;
  async function triggerUpdate() {
    if (!sectorsLocked) {
      const wantedSectorIds = await determineSectors(sectorRoot, camera, modelTranformation);
      activateDetailedSectors(wantedSectorIds.detailed);
      activateSimpleSectors(wantedSectorIds.simple);
    }
  }
  controls.addEventListener('update', async () => {
    await triggerUpdate();
  });
  triggerUpdate();

  document.addEventListener('keypress', event => {
    if (event.key === 'l') {
      sectorsLocked = !sectorsLocked;
      if (sectorsLocked) {
        console.log(`Sectors locked - will not load new sectors.`);
      } else {
        console.log(`Sectors unlocked - loading new sectors when view updates.`);
        triggerUpdate();
      }
    }
  });
  const rendererStats = createRendererStats();

  const clock = new THREE.Clock();
  const render = () => {
    requestAnimationFrame(render);

    const delta = clock.getDelta();
    const needsUpdate = controls.update(delta) || newDataAvailable;

    if (needsUpdate) {
      renderer.render(scene, camera);
      rendererStats.update(renderer);
      newDataAvailable = false;
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
