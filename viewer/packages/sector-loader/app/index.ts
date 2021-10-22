/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CogniteClient } from '@cognite/sdk';
import { CdfModelDataClient } from '@reveal/modeldata-api';
import { V8SectorRepository } from '../src/CachedRepository';
import { CadMaterialManager } from '@reveal/rendering';

init();

async function init() {
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000);

  const scene = new THREE.Scene();

  const client = new CogniteClient({ appId: 'reveal.example.simple' });
  await client.loginWithOAuth({ type: 'CDF_OAUTH', options: { project: '3ddemo' } });
  await client.authenticate();

  const modelDataClient = new CdfModelDataClient(client);
  const cadMaterialManager = new CadMaterialManager();

  const detailedSectorLoader = new V8SectorRepository(modelDataClient, cadMaterialManager);

  const sceneJson = await modelDataClient.getJsonFile(
    'https://api.cognitedata.com/api/v1/projects/3ddemo/3d/files/8077116380016442',
    'scene.json'
  );

  cadMaterialManager.addModelMaterials('8077116380016442', sceneJson.maxTreeIndex);

  const testSector = sceneJson.sectors[0];
  testSector.bounds = new THREE.Box3(testSector.boundingBox.min, testSector.boundingBox.max);

  const test = await detailedSectorLoader.loadSector({
    modelBaseUrl: 'https://api.cognitedata.com/api/v1/projects/3ddemo/3d/files/8077116380016442',
    modelIdentifier: '8077116380016442',
    metadata: testSector,
    levelOfDetail: 2,
    geometryClipBox: null
  });

  console.log(test);

  //https://greenfield.cognitedata.com/api/v1/projects/3d-test/3d/files/4781617717819216/sector_0.i3d

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const grid = new THREE.GridHelper(30, 40);
  grid.position.set(14, -1, -14);
  scene.add(grid);

  const cadFromCdfToThreeMatrix = new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);
  const group = new THREE.Group();
  group.applyMatrix4(cadFromCdfToThreeMatrix);
  scene.add(group);

  group.add(test.group!);

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
