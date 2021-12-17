/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import * as dat from 'dat.gui';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CogniteClient } from '@cognite/sdk';
import {
  CdfModelDataProvider,
  CdfModelIdentifier,
  CdfModelMetadataProvider,
  BlobOutputMetadata,
  File3dFormat
} from '@reveal/modeldata-api';
import { V8SectorRepository } from '../src/V8SectorRepository';
import { CadMaterialManager } from '@reveal/rendering';
import { GltfSectorRepository, SectorRepository } from '..';
import { revealEnv } from '../../utilities';

revealEnv.publicPath = 'https://apps-cdn.cogniteapp.com/@cognite/reveal-parser-worker/1.2.0/';

init();

async function init() {
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000);
  const scene = new THREE.Scene();

  const gui = new dat.GUI();
  const guiData = { formatVersion: 9 };
  const formatGuiController = gui.add(guiData, 'formatVersion', {
    gltfCadModel: 9,
    v8CadModel: 8
  });

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

  const modelId = parseInt(urlParams.get('modelId') ?? '1791160622840317');
  const revisionId = parseInt(urlParams.get('revisionId') ?? '498427137020189');

  const modelIdentifier = new CdfModelIdentifier(modelId, revisionId);

  const cdfModelMetadataProvider = new CdfModelMetadataProvider(client);
  cdfModelMetadataProvider.getModelOutputs(modelIdentifier);

  const outputs = await cdfModelMetadataProvider.getModelOutputs(modelIdentifier);
  const modelDataClient = new CdfModelDataProvider(client);
  const cadMaterialManager = new CadMaterialManager();

  let consumedModel = await loadSectors(outputs, guiData.formatVersion, modelDataClient, cadMaterialManager, client);

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

  formatGuiController.onChange(async _ => {
    group.remove(consumedModel);
    consumedModel = await loadSectors(outputs, guiData.formatVersion, modelDataClient, cadMaterialManager, client);
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

async function loadSectors(
  outputs: BlobOutputMetadata[],
  formatVersion: number,
  modelDataClient: CdfModelDataProvider,
  cadMaterialManager: CadMaterialManager,
  client: CogniteClient
) {
  const output = outputs.find(
    output => output.format === File3dFormat.RevealCadModel && output.version === formatVersion
  );
  const sceneJson = await modelDataClient.getJsonFile(
    `${client.getBaseUrl()}/api/v1/projects/${client.project}/3d/files/${output?.blobId}`,
    'scene.json'
  );

  cadMaterialManager.addModelMaterials(output!.blobId.toString(), sceneJson.maxTreeIndex);

  const sectorRepository: SectorRepository =
    formatVersion === 9
      ? new GltfSectorRepository(modelDataClient, cadMaterialManager)
      : new V8SectorRepository(modelDataClient, cadMaterialManager);

  const sector = sceneJson.sectors[0];
  sector.bounds = new THREE.Box3(sector.boundingBox.min, sector.boundingBox.max);

  const model = new THREE.Group();

  await Promise.all(
    sceneJson.sectors.map(async (sector: any) => {
      sector.bounds = new THREE.Box3(sector.boundingBox.min, sector.boundingBox.max);
      const consumedSector = await sectorRepository.loadSector({
        modelBaseUrl: `${client.getBaseUrl()}/api/v1/projects/${client.project}/3d/files/${output?.blobId}`,
        modelIdentifier: output!.blobId.toString(),
        metadata: sector,
        levelOfDetail: 2,
        geometryClipBox: null
      });

      model.add(consumedSector.group!);
    })
  );

  return model;
}
