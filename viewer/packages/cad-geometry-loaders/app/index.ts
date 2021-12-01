/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CogniteClient } from '@cognite/sdk';
import { CadModelFactory } from '../../../core/src/datamodels/cad/CadModelFactory';
import { CadMaterialManager } from '@reveal/rendering';
import { CdfModelDataProvider, CdfModelIdentifier, CdfModelMetadataProvider } from '@reveal/modeldata-api';
import { CadModelUpdateHandler } from '../src/CadModelUpdateHandler';
import { ByScreenSizeSectorCuller } from '..';
import { CadManager } from '../../../core/src/datamodels/cad/CadManager';
import { revealEnv } from '@reveal/utilities';
import dat from 'dat.gui';

revealEnv.publicPath = 'https://apps-cdn.cogniteapp.com/@cognite/reveal-parser-worker/1.2.0/';

init();

async function init() {
  const scene = new THREE.Scene();

  const gui = new dat.GUI();

  const guiData = { drawCalls: 0 };
  gui.add(guiData, 'drawCalls').listen();

  const client = new CogniteClient({ appId: 'reveal.example.simple' });
  await client.loginWithOAuth({
    type: 'AAD_OAUTH',
    options: {
      clientId: 'a03a8caf-7611-43ac-87f3-1d493c085579',
      cluster: 'greenfield',
      tenantId: '20a88741-8181-4275-99d9-bd4451666d6e'
    }
  });
  client.setProject('3d-test');
  await client.authenticate();

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  // Defaults to all-primitives model on 3d-test
  const modelId = parseInt(urlParams.get('modelId') ?? '1791160622840317');
  const revisionId = parseInt(urlParams.get('revisionId') ?? '498427137020189');

  const modelIdentifier = new CdfModelIdentifier(modelId, revisionId);
  const cdfModelMetadataProvider = new CdfModelMetadataProvider(client);
  const cdfModelDataProvider = new CdfModelDataProvider(client);

  const materialManager = new CadMaterialManager();
  const cadModelFactory = new CadModelFactory(materialManager, cdfModelMetadataProvider, cdfModelDataProvider);
  const cadModelUpdateHandler = new CadModelUpdateHandler(new ByScreenSizeSectorCuller());

  const cadManager = new CadManager(materialManager, cadModelFactory, cadModelUpdateHandler);

  cadManager.budget = {
    geometryDownloadSizeBytes: Infinity,
    highDetailProximityThreshold: cadManager.budget.highDetailProximityThreshold,
    maximumNumberOfDrawCalls: Infinity,
    maximumRenderCost: cadManager.budget.maximumRenderCost
  };

  const model = await cadManager.addModel(modelIdentifier);

  const cameraConfig = model.suggestCameraConfig();

  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    cameraConfig.near,
    cameraConfig.far
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const grid = new THREE.GridHelper(30, 40);
  grid.position.set(14, -1, -14);
  scene.add(grid);

  scene.add(model);

  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.copy(cameraConfig.position);
  controls.target.copy(cameraConfig.target);
  controls.update();

  cadModelUpdateHandler.updateCamera(camera);
  cadModelUpdateHandler.getLoadingStateObserver().subscribe({ next: render });

  document.body.appendChild(renderer.domElement);

  controls.addEventListener('change', () => {
    cadModelUpdateHandler.updateCamera(camera);
    render();
  });

  await new Promise(_ => setTimeout(_, 2000));

  render();

  function render() {
    window.requestAnimationFrame(() => {
      controls.update();
      renderer.render(scene, camera);
      guiData.drawCalls = renderer.info.render.calls;
    });
  }
}
