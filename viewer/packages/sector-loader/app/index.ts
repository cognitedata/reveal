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
import { CadMaterialManager, Materials } from '@reveal/rendering';
import { GltfSectorRepository, SectorRepository } from '..';
import { revealEnv, assertNever } from '../../utilities';
import { createApplicationSDK } from '../../../test-utilities/src/appUtils';
import { ConsumedSector } from '@reveal/cad-parsers';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import { CadSceneRootMetadata, BoundingBox } from '@reveal/cad-parsers/src/metadata/parsers/types';

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

  const client = await createApplicationSDK('reveal.example.simple', {
    project: '3d-test',
    cluster: 'greenfield',
    clientId: 'a03a8caf-7611-43ac-87f3-1d493c085579',
    tenantId: '20a88741-8181-4275-99d9-bd4451666d6e'
  });

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
    let fv = guiData.formatVersion;
    if (typeof fv === 'string') {
      fv = parseInt(fv);
    }
    consumedModel = await loadSectors(outputs, fv, modelDataClient, cadMaterialManager, client);
    group.add(consumedModel);
  });

  const controls = new OrbitControls(camera, renderer.domElement);
  const target = new THREE.Vector3(10, 0, 0);
  camera.position.add(new THREE.Vector3(10, 20, 20));
  controls.target.copy(target);
  controls.update();

  document.body.appendChild(renderer.domElement);
  renderer.domElement.style.backgroundColor = '#000000';

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
  const wantedFormat = formatVersion == 8 ? File3dFormat.RevealCadModel : File3dFormat.GltfCadModel;

  const output = outputs.find(output => output.format === wantedFormat && output.version === formatVersion);

  const sceneJson = (await modelDataClient.getJsonFile(
    `${client.getBaseUrl()}/api/v1/projects/${client.project}/3d/files/${output?.blobId}`,
    'scene.json'
  )) as CadSceneRootMetadata;

  cadMaterialManager.addModelMaterials(output!.blobId.toString(), sceneJson.maxTreeIndex);

  const sectorRepository: SectorRepository =
    formatVersion === 9
      ? new GltfSectorRepository(modelDataClient, cadMaterialManager)
      : new V8SectorRepository(modelDataClient, cadMaterialManager);

  const model = new THREE.Group();

  const modelIdentifier = output!.blobId.toString();

  function toThreeBox(box: BoundingBox) {
    return new THREE.Box3(
      new THREE.Vector3(box.min.x, box.min.y, box.min.z),
      new THREE.Vector3(box.max.x, box.max.y, box.max.z)
    );
  }

  await Promise.all(
    sceneJson.sectors.map(async sector => {
      const threeBoundingBox = toThreeBox(sector.boundingBox);
      const consumedSector = await sectorRepository.loadSector({
        modelBaseUrl: `${client.getBaseUrl()}/api/v1/projects/${client.project}/3d/files/${output?.blobId}`,
        modelIdentifier,
        metadata: {
          ...sector,
          subtreeBoundingBox: threeBoundingBox,
          geometryBoundingBox: undefined,
          children: [],
          estimatedRenderCost: 0
        },
        levelOfDetail: 2,
        geometryClipBox: null
      });

      if (consumedSector.group) {
        model.add(consumedSector.group);
      }

      if (formatVersion === 9) {
        const group = createGltfSectorGroup(consumedSector, cadMaterialManager.getModelMaterials(modelIdentifier));
        model.add(group);
      }
    })
  );

  return model;
}

function createGltfSectorGroup(consumedSector: ConsumedSector, materials: Materials) {
  const geometryGroup = new THREE.Group();

  for (const parsedGeometry of consumedSector.geometryBatchingQueue!) {
    const material = getShaderMaterial(parsedGeometry.type, materials);

    const count = parsedGeometry.geometryBuffer.getAttribute('a_treeIndex').count;

    const mesh = new THREE.InstancedMesh(parsedGeometry.geometryBuffer, material, count);

    mesh.onBeforeRender = (_0, _1, camera: THREE.Camera) => {
      if (material.uniforms.renderMode) {
        material.uniforms.renderMode.value = 1;
      }
      (material.uniforms.inverseModelMatrix?.value as THREE.Matrix4)?.copy(mesh.matrixWorld).invert();
      (material.uniforms.cameraPosition?.value as THREE.Vector3)?.copy(camera.position);
      material.needsUpdate = true;
    };

    mesh.updateMatrixWorld(true);

    geometryGroup.add(mesh);
  }

  return geometryGroup;
}

function getShaderMaterial(type: RevealGeometryCollectionType, materials: Materials): THREE.RawShaderMaterial {
  switch (type) {
    case RevealGeometryCollectionType.BoxCollection:
      return materials.box;
    case RevealGeometryCollectionType.CircleCollection:
      return materials.circle;
    case RevealGeometryCollectionType.ConeCollection:
      return materials.cone;
    case RevealGeometryCollectionType.EccentricConeCollection:
      return materials.eccentricCone;
    case RevealGeometryCollectionType.EllipsoidSegmentCollection:
      return materials.ellipsoidSegment;
    case RevealGeometryCollectionType.GeneralCylinderCollection:
      return materials.generalCylinder;
    case RevealGeometryCollectionType.GeneralRingCollection:
      return materials.generalRing;
    case RevealGeometryCollectionType.QuadCollection:
      return materials.quad;
    case RevealGeometryCollectionType.TorusSegmentCollection:
      return materials.torusSegment;
    case RevealGeometryCollectionType.TrapeziumCollection:
      return materials.trapezium;
    case RevealGeometryCollectionType.NutCollection:
      return materials.nut;
    case RevealGeometryCollectionType.TriangleMesh:
      return materials.triangleMesh;
    case RevealGeometryCollectionType.InstanceMesh:
      return materials.instancedMesh;
    default:
      assertNever(type);
  }
}
