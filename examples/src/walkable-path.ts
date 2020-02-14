/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import * as reveal from '@cognite/reveal';
import { CogniteClient, HttpError } from '@cognite/sdk';
import { toThreeVector3, CadNode } from '@cognite/reveal/threejs';
import { vec3 } from 'gl-matrix';
import { SectorModelTransformation } from '@cognite/reveal/models/cad/types';
import { GUI, GUIController } from 'dat.gui';

CameraControls.install({ THREE });

interface Coordinates {
  x: number;
  y: number;
  z: number;
}

interface NodeIdReference {
  nodeId: number;
}

interface TransitItem {
  from: Coordinates | NodeIdReference;
  to: Coordinates | NodeIdReference;
  movingObjectSize: { diameter: number; height: number };
}

interface TransitPathRequest {
  modelId: number;
  items: TransitItem[];
}

// Should find a way to add this to maybe cognite-sdk-js later?

// TODO: Should be added to reveal/viewer. The input data TransitPath response is in my
// opinion too coupled with our sdk response, should we split it into two funcitons, one taking in a { x, y, z}[]
// and another converting the response to said array.

async function main() {
  const url = new URL(location.href);
  const project = url.searchParams.get('projectId') || 'publicdata';

  const modelUrl = new URL(location.href).searchParams.get('model') || '/primitives';
  const cadModel = await reveal.createLocalCadModel(modelUrl);

  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const cadNode = new CadNode(cadModel);
  const { position, target, near, far } = cadNode.suggestCameraConfig();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far);
  const controls = new CameraControls(camera, renderer.domElement);

  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();
  scene.add(cadNode);
  const walkablePathSdkClient = createWalkablePathClient(project);

  let updated = false;
  const pathMeshes: THREE.Mesh[] = [];

  const removeWalkablePath = () => {
    if (pathMeshes !== undefined) {
      for (const pathMesh of pathMeshes) {
        scene.remove(pathMesh);
      }
      pathMeshes.splice(0, pathMeshes.length);
      updated = true;
    }
  };
  createGUIWrapper({
    create: walkablePath => async () => {
      const walkablePathResponse = await walkablePathSdkClient.getTransitPath(walkablePath);
      removeWalkablePath();
      for (const mesh of createWalkablePath(walkablePathResponse, cadModel.modelTransformation)) {
        scene.add(mesh);
        pathMeshes.push(mesh);
      }
      updated = true;
    },
    remove: removeWalkablePath
  });

  const clock = new THREE.Clock();
  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    const sectorsNeedUpdate = await cadNode.update(camera);
    const walkablePathUpdated = updated;

    if (controlsNeedUpdate || sectorsNeedUpdate || walkablePathUpdated) {
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

const createWalkablePath = (
  walkablePathResponse: TransitPathResponse,
  modelTransformation: SectorModelTransformation
) => {
  const pathMeshes = [];
  try {
    const diameter = 0.55;
    const pathArray = createVector3Array(walkablePathResponse, modelTransformation);

    for (const path of pathArray) {
      const pathGeometry = createPathGeometry(path, 2 * (path.length - 1), diameter / 20, 10, false);
      const pathMaterial = new THREE.MeshPhongMaterial({ color: 0xfeafeafe });
      const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
      pathMesh.position.y += diameter / 4;
      pathMeshes.push(pathMesh);
    }
  } catch (error) {}
  return pathMeshes;
};

function createVector3Array(
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
function createPathGeometry(
  points: THREE.Vector3[],
  segments: number,
  radius: number,
  radiusSegments: number,
  closed: boolean
) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeBufferGeometry(curve, segments, radius, radiusSegments, closed);
  return geometry;
}

function createGUIWrapper(callbacks: { create: (query: TransitPathRequest) => void; remove: () => void }) {
  interface ItemTypeStorage {
    type: string;
    data: Coordinates | NodeIdReference;
  }
  function isCoordinates(object: any): object is Coordinates {
    return 'x' in object && 'y' in object && 'z' in object;
  }
  function isNodeIdReference(object: any): object is NodeIdReference {
    return 'nodeId' in object;
  }
  function defaultQueryParams(): TransitPathRequest {
    return {
      modelId: 3329507622597457,
      items: [defaultItem()]
    };
  }
  function defaultItem(): TransitItem {
    return {
      from: { x: 332.4, y: 117.6, z: 500.21 },
      to: { x: 332.38, y: 114.6, z: 517.02 },
      movingObjectSize: { diameter: 0.55, height: 1.6 }
    };
  }

  let walkablePath = defaultQueryParams();
  const gui = new GUI({ width: 300 });
  const actions = {
    addItem: () => {
      if (gui !== undefined) {
        gui.destroy();
        walkablePath.items.push(defaultItem());
        createQueryGUI();
      }
    },
    removeItemAt: (index: number) => {
      if (gui !== undefined) {
        gui.destroy();
        walkablePath.items.splice(index, 1);
        createQueryGUI();
      }
    },
    findPath: () => {
      callbacks.create.call(gui, walkablePath);
    },
    removePath: callbacks.remove,
    resetToDefault: () => {
      if (gui !== undefined) {
        gui.destroy();
        walkablePath = defaultQueryParams();
        createQueryGUI();
      }
    }
  };
  function defaultStorage(type: string, data: Coordinates | NodeIdReference): ItemTypeStorage {
    return {
      type,
      data
    };
  }
  const createQueryGUI = (): GUI => {
    // Move out of function
    gui.add(walkablePath, 'modelId');
    gui.add(actions, 'addItem');
    const items = gui.addFolder('items');
    items.open();
    let index = 0;
    for (const item of walkablePath.items) {
      const indexFolder = items.addFolder(`${index}`);
      const removeItemController = indexFolder.add({ delete: () => {} }, 'delete');
      const removeIndex = index;
      const removeFunction = () => {
        actions.removeItemAt(removeIndex);
      };
      removeItemController.onChange(removeFunction);
      indexFolder.open();
      const from = indexFolder.addFolder('from');
      from.open();
      createWaypointGUI(from, item.from, { x: 332.4, y: 117.6, z: 500.21 });
      const to = indexFolder.addFolder('to');
      to.open();
      createWaypointGUI(to, item.to, { x: 332.38, y: 114.6, z: 517.02 });

      const movingObjectSize = indexFolder.addFolder('movingObjectSize');
      movingObjectSize.add(item.movingObjectSize, 'diameter');
      movingObjectSize.add(item.movingObjectSize, 'height');
      index += 1;
    }
    gui.add(actions, 'findPath');
    gui.add(actions, 'removePath');
    gui.add(actions, 'resetToDefault');
    return gui;
  };

  const addToGui = <T>(parent: GUI, target: T, items: string[]) => {
    const addedItems: GUIController[] = [];
    for (const item of items) {
      addedItems.push(parent.add(target, item));
    }
    return addedItems;
  };

  const createWaypointGUI = (
    parent: GUI,
    waypoint: Coordinates | NodeIdReference,
    defaultCoordinates: Coordinates,
    defaultNodeId: NodeIdReference = { nodeId: 0 }
  ) => {
    let type: GUIController;
    let storage: ItemTypeStorage;
    let items: GUIController[];
    if (isCoordinates(waypoint)) {
      storage = defaultStorage('coordinates', defaultNodeId);
      type = parent.add(storage, 'type', ['coordinates', 'nodeId']);
      items = addToGui(parent, waypoint, ['x', 'y', 'z']);
    } else if (isNodeIdReference(waypoint)) {
      storage = defaultStorage('nodeId', defaultCoordinates);
      type = parent.add(storage, 'type', ['coordinates', 'nodeId']);
      items = addToGui(parent, waypoint, ['nodeId']);
    } else {
      return;
    }
    type.onChange((value: string) => {
      const oldData = waypoint;
      waypoint = storage.data;
      for (const item of items) {
        parent.remove(item);
      }
      switch (value) {
        default:
        case 'coordinates':
          items = addToGui(parent, waypoint, ['x', 'y', 'z']);
          break;
        case 'nodeId':
          items = addToGui(parent, waypoint, ['nodeId']);
          break;
      }
      storage.data = oldData;
    });
  };
  createQueryGUI();
}

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

function createWalkablePathClient(project: string) {
  const client: CogniteClient = new CogniteClient({ appId: 'Reveal Examples - WalkablePath' });
  client.loginWithOAuth({
    project
  });

  const getTransitPath = async (transitRequest: TransitPathRequest): Promise<TransitPathResponse> => {
    const url = `https://api.cognitedata.com/api/playground/projects/${project}/3d/pathfinder/transit`;
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
