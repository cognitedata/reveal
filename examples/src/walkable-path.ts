/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { CogniteClient, HttpError } from '@cognite/sdk';
import { toThreeVector3, RevealManager, CadNode } from '@cognite/reveal/threejs';
import { vec3 } from 'gl-matrix';
import { SectorModelTransformation } from '@cognite/reveal';
import { GUI, GUIController } from 'dat.gui';
import { getParamsFromURL } from './utils/example-helpers';

CameraControls.install({ THREE });

interface Coordinates {
  x: number;
  y: number;
  z: number;
}

interface NodeIdReference {
  nodeId: number;
}

interface TransitPathRequest {
  modelId: number;
  items: {
    from: Coordinates | NodeIdReference;
    to: Coordinates | NodeIdReference;
    movingObjectSize: { diameter: number; height: number };
  }[];
}

async function main() {
  const { project, modelUrl, modelRevision } = getParamsFromURL({ project: 'publicdata', modelUrl: 'primitives' });
  const client = new CogniteClient({ appId: 'reveal.example.walkable-path' });
  client.loginWithOAuth({ project });

  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  let modelsNeedUpdate = true;
  const revealManager = new RevealManager(client, () => {
    modelsNeedUpdate = true;
  });
  let cameraConfig;
  let cadNode: CadNode;
  if (modelUrl) {
    const model = await revealManager.addModelFromUrl(modelUrl);
    cadNode = model;
    cameraConfig = model.suggestCameraConfig();
    scene.add(model);
  }
  if (modelRevision) {
    const model = await revealManager.addModelFromCdf(modelRevision);
    cameraConfig = model.suggestCameraConfig();
    cadNode = model;
    scene.add(model);
  }
  if (cameraConfig === undefined) {
    throw new Error('Need to provide either project & model OR modelUrl as query parameters');
  }

  const { position, target, near, far } = cameraConfig;
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far);
  const controls = new CameraControls(camera, renderer.domElement);
  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();

  const walkablePathSdkClient = createNetworkDataSource(client);

  let updated = false;
  const pathMeshes: THREE.Mesh[] = [];

  const removeWalkablePath = () => {
    for (const pathMesh of pathMeshes) {
      scene.remove(pathMesh);
    }
    pathMeshes.splice(0, pathMeshes.length);
    updated = true;
  };

  createGUIWrapper(modelRevision ? modelRevision : 0, {
    createWalkablePath: async (walkablePath: TransitPathRequest) => {
      const walkablePathResponse = await walkablePathSdkClient.getTransitPath(walkablePath);
      removeWalkablePath();
      const vector3Path = convertToVector3Array(walkablePathResponse, cadNode.modelTransformation);
      const meshes = createWalkablePathMeshes(vector3Path);
      for (const mesh of meshes) {
        scene.add(mesh);
        pathMeshes.push(mesh);
      }
      updated = true;
    },
    removeWalkablePath
  });

  const clock = new THREE.Clock();
  const render = () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    if (controlsNeedUpdate) {
      revealManager.update(camera);
    }
    const walkablePathUpdated = updated;

    if (controlsNeedUpdate || modelsNeedUpdate || walkablePathUpdated) {
      updated = false;
      renderer.render(scene, camera);
    }

    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
  (window as any).renderer = renderer;
}

// TODO: Add to some kind of primitives like class in reveal viewer?

function createWalkablePathMeshes(
  pathArrays: THREE.Vector3[][],
  radius: number = 0.0275,
  radiusSegments: number = 10,
  closed: boolean = false,
  heightOffset: number = 0.15
) {
  const meshes = [];
  try {
    for (const path of pathArrays) {
      const curve = new THREE.CatmullRomCurve3(path);
      const geometry = new THREE.TubeBufferGeometry(curve, 2 * (path.length - 1), radius, radiusSegments, closed);
      const material = new THREE.MeshPhongMaterial({ color: 0xfeafeafe });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y += heightOffset;
      meshes.push(mesh);
    }
  } catch (error) { }
  return meshes;
}

// THREE js parser, from TransitResponse to Vector3

function convertToVector3Array(
  pointData: TransitPathResponse,
  modelTransformation: SectorModelTransformation
): THREE.Vector3[][] {
  const paths: THREE.Vector3[][] = [];
  const vector: vec3 = vec3.create();
  for (const item of pointData.items) {
    const pathVectors: THREE.Vector3[] = [];
    for (const segment of item.segments) {
      for (const path of segment.path) {
        vec3.set(vector, path.x, path.y, path.z);
        pathVectors.push(toThreeVector3(new THREE.Vector3(), vector, modelTransformation));
      }
    }
    paths.push(pathVectors);
  }
  return paths;
}

// Parser from GUI Data, to API request
function transformDataToRequest(data: TransitPathData): TransitPathRequest {
  return {
    modelId: data.modelId,
    items: data.items.map(item => {
      return {
        from: transformWaypoint(item.from),
        to: transformWaypoint(item.to),
        movingObjectSize: item.movingObjectSize
      };
    })
  };
}
// Helper Parser from GUI Data, to API format
function transformWaypoint(data: Waypoint): Coordinates | NodeIdReference {
  switch (data.type) {
    case Type.coordinates:
      return data.coordinates;
    case Type.nodeId:
      return data.nodeId;
    default:
      throw new TypeError('');
  }
}

// GUI Wrapper with callbacks on create / remove path
function createGUIWrapper(
  modelId: number,
  callbacks: {
    createWalkablePath: (data: TransitPathRequest) => void;
    removeWalkablePath: () => void;
  }
) {
  let transitPathData = defaultPathData(modelId);
  const gui = new GUI({ width: 300 });
  updateQueryGUI(gui, transitPathData);
  gui.add(
    {
      resetToDefault: () => {
        transitPathData = defaultPathData(modelId);
        gui.destroy();
        createGUIWrapper(modelId, callbacks);
      }
    },
    'resetToDefault'
  );
  gui.add(
    {
      createWalkablePath: () => {
        callbacks.createWalkablePath.call(gui, transformDataToRequest(transitPathData));
      }
    },
    'createWalkablePath'
  );
  gui.add(callbacks, 'removeWalkablePath');
}

enum Type {
  coordinates = 'coordinates',
  nodeId = 'nodeId'
}

interface Waypoint {
  type: Type;
  coordinates: Coordinates;
  nodeId: NodeIdReference;
}

interface TransitPathItem {
  from: Waypoint;
  to: Waypoint;
  movingObjectSize: { diameter: number; height: number };
}

interface TransitPathData {
  modelId: number;
  items: TransitPathItem[];
}

function defaultPathData(modelId: number): TransitPathData {
  return {
    modelId,
    items: [defaultPathItem()]
  };
}

function defaultPathItem(): TransitPathItem {
  return {
    from: {
      type: Type.coordinates,
      coordinates: { x: 332.4, y: 117.6, z: 500.21 },
      nodeId: { nodeId: 0 }
    },
    to: {
      type: Type.coordinates,
      coordinates: { x: 332.38, y: 114.6, z: 517.02 },
      nodeId: { nodeId: 0 }
    },
    movingObjectSize: { diameter: 0.55, height: 1.6 }
  };
}

function updateQueryGUI(parent: GUI, data: TransitPathData): GUI {
  const queryFolder = parent.addFolder('WalkablePath');
  queryFolder.open();
  queryFolder.add(data, 'modelId');
  const updateItems = () => {
    queryFolder.removeFolder(itemsFolder);
    itemsFolder = updateItemsGUI(queryFolder, data.items, updateItems);
  };
  let itemsFolder = updateItemsGUI(queryFolder, data.items, updateItems);
  return queryFolder;
}

function updateItemsGUI(parent: GUI, items: TransitPathItem[], onItemsUpdated: () => void) {
  const itemsFolder = parent.addFolder('items');
  itemsFolder.open();
  itemsFolder.add(
    {
      addItem: () => {
        const newItem = defaultPathItem();
        items.push(newItem);
        onItemsUpdated();
      }
    },
    'addItem'
  );
  let index = 0;
  for (const item of items) {
    const itemIndex = index;
    const indexFolder = itemsFolder.addFolder(`${index}`);
    indexFolder.open();
    createItemGUI(indexFolder, item, () => {
      items.splice(itemIndex, 1);
      onItemsUpdated();
    });
    index += 1;
  }
  return itemsFolder;
}

function createItemGUI(parent: GUI, item: TransitPathItem, onDelete: () => void) {
  parent.add(
    {
      delete: onDelete
    },
    'delete'
  );
  const from = parent.addFolder('from');
  from.open();
  createWaypointGUI(from, item.from);
  const to = parent.addFolder('to');
  to.open();
  createWaypointGUI(to, item.to);

  const movingObjectSize = parent.addFolder('movingObjectSize');
  movingObjectSize.add(item.movingObjectSize, 'diameter');
  movingObjectSize.add(item.movingObjectSize, 'height');
}

function getWaypointData(waypoint: Waypoint) {
  switch (waypoint.type) {
    case Type.coordinates:
      return waypoint.coordinates;
    case Type.nodeId:
      return waypoint.nodeId;
    default:
      throw new TypeError('');
  }
}

function createWaypointGUI(parent: GUI, waypoint: Waypoint) {
  const type = parent.add(waypoint, 'type', Object.values(Type));
  const data = getWaypointData(waypoint);
  let items = addToGui(parent, data, Object.keys(data));
  type.onChange(() => {
    for (const item of items) {
      parent.remove(item);
    }
    const newData = getWaypointData(waypoint);
    items = addToGui(parent, newData, Object.keys(newData));
  });
}

function addToGui<T>(parent: GUI, target: T, items: string[]) {
  const addedItems: GUIController[] = [];
  for (const item of items) {
    addedItems.push(parent.add(target, item));
  }
  return addedItems;
}

// Cognite Client, returns a function that queries the api for TransitPathResponse.
interface TransitPathResponse {
  items: [
    {
      segments: [
        {
          path: Coordinates[];
        }
      ];
    }
  ];
}

function createNetworkDataSource(
  client: CogniteClient
): { getTransitPath: (transitRequest: TransitPathRequest) => Promise<TransitPathResponse> } {
  const getTransitPath = async (transitRequest: TransitPathRequest): Promise<TransitPathResponse> => {
    const url = `https://api.cognitedata.com/api/playground/projects/${client.project}/3d/pathfinder/transit`;
    const response = await client.post<TransitPathResponse>(url, {
      data: transitRequest
    });
    if (response.status === 200) {
      return response.data;
    } else {
      throw new HttpError(response.status, response.data, response.headers);
    }
  };

  return { getTransitPath };
}

main();
