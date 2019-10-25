/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { determineSectors } from './sector/determineSectors';
import { initializeThreeJsView } from './views/threejs/initializeThreeJsView';
import { initializeSectorLoader } from './sector/initializeSectorLoader';
import { createSectorModel } from './datasources/cognitesdk';
import { WellKnownModels } from './example/models';
import { CogniteClient } from '@cognite/sdk';
import CameraControls from 'camera-controls';
import { createParser } from './sector/parseSectorData';
import { vec3 } from 'gl-matrix';
import { createLocalSectorModel } from './datasources/local/createLocalSectorModel';

CameraControls.install({ THREE });

async function main() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 4;
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

  // const [fetchSectorMetadata, fetchSector, fetchCtmFile] = createSectorModel(sdk, model.modelId, model.revisionId);
  const [fetchSectorMetadata, fetchSector, fetchCtmFile] = createLocalSectorModel(
    '/***REMOVED***'
  );
  const [sectorRoot, modelTranformation] = await fetchSectorMetadata();
  const parseSectorData = await createParser(sectorRoot, fetchSector, fetchCtmFile);
  const [rootGroup, discardSector, consumeSector] = initializeThreeJsView(sectorRoot, modelTranformation);
  const activateSectors = initializeSectorLoader(fetchSector, parseSectorData, discardSector, consumeSector);

  // const sphere = new THREE.SphereBufferGeometry(10, 10, 10);
  // const sphereMesh = new THREE.Mesh(sphere, new THREE.MeshPhongMaterial({ color: 0xff0040 }));
  // sphereMesh.position.set(340, 505, -90);
  // scene.add(sphereMesh);
  const light = new THREE.PointLight(0xffffff, 1, 1000);
  light.position.set(340, 600, -90);
  scene.add(light);
  scene.add(rootGroup);
  // camera.position.set(377, 515, -49);
  // camera.quaternion.set(0.9466601468167791, -0.20321833011834264, 0.24450350631960607, 0.052487256835970685);
  camera.near = 0.12;
  const cameraSettings = JSON.parse(
    `{"metadata":{"version":4.5,"type":"Object","generator":"Object3D.toJSON"},"object":{"uuid":"D5181987-D997-4748-8D8E-B3A9190DF76C","type":"PerspectiveCamera","layers":1,"matrix":[0.8574929675979904,1.3877787807814457e-17,-0.514495685618443,0,-0.08696563208523098,0.9856107644300784,-0.14494274688846207,0,0.507092485998371,0.16903082866612393,0.8451542992876718,0,378.31335449218744,498.1444396972656,-41.49257278442376,1],"fov":60,"zoom":1,"near":0.12708286802893284,"far":127.08286802893284,"focus":10,"aspect":2.979220779220779,"filmGauge":35,"filmOffset":0}}`
  );
  const matrix = cameraSettings.object.matrix as number[];
  camera.applyMatrix(new THREE.Matrix4().fromArray(matrix));
  // fitCameraToBoundingBox(camera, sectorRoot.bounds);

  // const modelCenter = toThreeJsVector3(sectorRoot.bounds.center);
  /*
  const serialized = {
    enabled: true,
    minDistance: 0,
    maxDistance: 1.7976931348623157e308,
    minPolarAngle: 0,
    maxPolarAngle: 3.141592653589793,
    minAzimuthAngle: -1.7976931348623157e308,
    maxAzimuthAngle: 1.7976931348623157e308,
    dampingFactor: 0.05,
    draggingDampingFactor: 0.25,
    dollySpeed: 1,
    truckSpeed: 2,
    dollyToCursor: false,
    verticalDragToForward: false,
    target: [540.228675351044, 500.9819754496807, -237.21958794550298],
    position: [255.33895135088414, 521.8579329511451, -44.1740314394018],
    target0: [0, 0, 0],
    position0: [380.3417244361809, 498.8205630119301, -38.11195558727307]
  };
   */

  // "max": [
  // 353.5685119628906,
  // 99.21824645996094,
  // 500.8486633300781
  // ],
  // "min": [
  // 330.697021484375,
  // 84.89916229248047,
  // 500.3190002441406
  // ]

  const controls = new CameraControls(camera, renderer.domElement);

  const pos = vec3.transformMat4(
    vec3.create(),
    vec3.fromValues(353.5685119628906, 99.21824645996094, 510.8486633300781),
    modelTranformation.modelMatrix
  );
  const target = vec3.transformMat4(
    vec3.create(),
    vec3.fromValues(330.697021484375, 84.89916229248047, 500.3190002441406),
    modelTranformation.modelMatrix
  );

  controls.setLookAt(pos[0], pos[1], pos[2], target[0], target[1], target[2]);
  controls.update(0.0);

  // renderer.domElement.onmousedown = downEvent => {
  //   const { x0, y0 } = { x0: downEvent.x, y0: downEvent.y };
  //   renderer.domElement.onmousemove = async moveEvent => {
  //     // const { dx, dy } = { dx: moveEvent.x - x0, dy: moveEvent.y - y0 };
  //     // camera.position.x = dx / 100;
  //     // camera.position.y = dy / 100;

  //     const wantedSectorIds = await determineSectors(sectorRoot, camera);
  //     activateSectors(wantedSectorIds);
  //   };
  // };
  // renderer.domElement.onmouseup = upEvent => {
  //   renderer.domElement.onmousemove = undefined;
  // };

  async function triggerUpdate() {
    const wantedSectorIds = await determineSectors(sectorRoot, camera, modelTranformation);
    activateSectors(wantedSectorIds);
  }
  controls.addEventListener('update', async () => {
    await triggerUpdate();
  });
  triggerUpdate();

  const clock = new THREE.Clock();
  const render = () => {
    requestAnimationFrame(render);

    const delta = clock.getDelta();
    const needsUpdate = controls.update(delta);

    if (needsUpdate) {
      renderer.render(scene, camera);
    }
  };
  render();

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
}

// function fetchSectorMetadata(): SectorMetadata {
//   return {
//     id: 0,
//     children: [
//       { id: 1, children: [{ id: 3, children: [] }, { id: 4, children: [] }] },
//       { id: 2, children: [{ id: 5, children: [] }] },
//       { id: 6, children: [{ id: 7, children: [] }, { id: 8, children: [] }, { id: 9, children: [] }] }
//     ]
//   };
// }

main();
