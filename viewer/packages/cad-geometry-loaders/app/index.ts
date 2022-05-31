/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CadModelFactory } from '@reveal/cad-model';
import { CadMaterialManager } from '@reveal/rendering';
import { CdfModelDataProvider, CdfModelIdentifier, CdfModelMetadataProvider } from '@reveal/modeldata-api';
import { CadModelUpdateHandler } from '../src/CadModelUpdateHandler';
import { ByScreenSizeSectorCuller } from '../src/sector/culling/ByScreenSizeSectorCuller';
import { CadManager } from '../src/CadManager';
import { revealEnv } from '@reveal/utilities';
import dat from 'dat.gui';
import { createApplicationSDK } from '../../../test-utilities/src/appUtils';

revealEnv.publicPath = 'https://apps-cdn.cogniteapp.com/@cognite/reveal-parser-worker/1.2.0/';

init();

async function init() {
  const scene = new THREE.Scene();

  const gui = new dat.GUI();

  const guiData = { drawCalls: 0 };
  gui.add(guiData, 'drawCalls').listen();

  const client = await createApplicationSDK('reveal.example.simple', {
    project: '3d-test',
    cluster: 'greenfield',
    clientId: 'a03a8caf-7611-43ac-87f3-1d493c085579',
    tenantId: '20a88741-8181-4275-99d9-bd4451666d6e'
  });

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
    highDetailProximityThreshold: cadManager.budget.highDetailProximityThreshold,
    maximumRenderCost: cadManager.budget.maximumRenderCost
  };

  const model = await cadManager.addModel(modelIdentifier);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 3, 1000);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const grid = new THREE.GridHelper(30, 40);
  grid.position.set(14, -1, -14);
  scene.add(grid);

  scene.add(model);

  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.copy(new THREE.Vector3(10, 10, 10));
  controls.target.copy(new THREE.Vector3(10, 0, -10));
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
