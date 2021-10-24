/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import * as dat from 'dat.gui';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CogniteClient } from '@cognite/sdk';
import { CdfModelDataProvider, CdfModelOutputsProvider, CdfModelIdentifier, File3dFormat } from '@reveal/modeldata-api';
import { V8SectorRepository } from '../src/V8SectorRepository';
import { CadMaterialManager } from '@reveal/rendering';
import { GltfSectorRepository, SectorRepository } from '..';
import { Model3DOutputList } from '@reveal/modeldata-api/src/Model3DOutputList';

init();

async function init() {
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000);

  const scene = new THREE.Scene();

  const gui = new dat.GUI();
  const guiData = { format: File3dFormat.GltfCadModel};
  const formatGuiController = gui.add(guiData, 'format', {gltfCadModel: File3dFormat.GltfCadModel, v8CadModel: File3dFormat.RevealCadModel});

  const client = new CogniteClient({ appId: 'reveal.example.simple' });
  await client.loginWithOAuth({ type: 'CDF_OAUTH', options: { project: '3ddemo' } });
  await client.authenticate();

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const modelId = parseInt(urlParams.get('modelId') ?? '2890599736800729');
  const revisionId = parseInt(urlParams.get('revisionId') ?? '8160779262643447');

  const modelIdentifier = new CdfModelIdentifier(modelId, revisionId, File3dFormat.AnyFormat);

  const outputProvider = new CdfModelOutputsProvider(client);
  const outputs = await outputProvider.getOutputs(modelIdentifier);

  const modelDataClient = new CdfModelDataProvider(client);
  const cadMaterialManager = new CadMaterialManager();
  
  let consumedModel = await loadSector(outputs, guiData, modelDataClient, cadMaterialManager, client);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const grid = new THREE.GridHelper(30, 40);
  grid.position.set(14, -1, -14);
  scene.add(grid);

  const cadFromCdfToThreeMatrix = new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);
  const group = new THREE.Group();
  group.applyMatrix4(cadFromCdfToThreeMatrix);
  scene.add(group);

  group.add(consumedModel);

  formatGuiController.onChange(async (_) => {
    group.remove(consumedModel);
    consumedModel = await loadSector(outputs, guiData, modelDataClient, cadMaterialManager, client);
    group.add(consumedModel);
  });

  const controls = new OrbitControls(camera, renderer.domElement);
  const target = new THREE.Vector3(10, 0, 0);
  camera.position.add(new THREE.Vector3(10, 20, 20));
  controls.target.copy(target);
  controls.update();

  document.body.appendChild(renderer.domElement);

  renderer.setAnimationLoop(_ => {
    controls.update();
    renderer.render(scene, camera);
  });
}

async function loadSector(outputs: Model3DOutputList, guiData: { format: File3dFormat; }, modelDataClient: CdfModelDataProvider, cadMaterialManager: CadMaterialManager, client: CogniteClient) {
  var blobId = outputs.findMostRecentOutput(guiData.format)?.blobId.toString()!;

  const sceneJson = await modelDataClient.getJsonFile(
    'https://api.cognitedata.com/api/v1/projects/3ddemo/3d/files/' + blobId,
    'scene.json'
  );

  cadMaterialManager.addModelMaterials(blobId, sceneJson.maxTreeIndex);
  
  const sectorRepository: SectorRepository = (guiData.format === File3dFormat.GltfCadModel)
    ? new GltfSectorRepository(modelDataClient, cadMaterialManager)
    : new V8SectorRepository(modelDataClient, cadMaterialManager);

  const sector = sceneJson.sectors[0];
  sector.bounds = new THREE.Box3(sector.boundingBox.min, sector.boundingBox.max);

  var model = new THREE.Group();

  await Promise.all(sceneJson.sectors.map(async (sector: any) => {
    sector.bounds = new THREE.Box3(sector.boundingBox.min, sector.boundingBox.max);
    const consumedSector = await sectorRepository.loadSector({
      modelBaseUrl: client.getBaseUrl() + '/api/v1/projects/3ddemo/3d/files/' + blobId,
      modelIdentifier: blobId,
      metadata: sector,
      levelOfDetail: 2,
      geometryClipBox: null
    });

    model.add(consumedSector.group!);
  }));

  return model;
}

