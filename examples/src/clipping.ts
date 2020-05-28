/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import * as reveal from '@cognite/reveal/experimental';
import CameraControls from 'camera-controls';
import dat from 'dat.gui';
import { getParamsFromURL, createRenderManager } from './utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import { BoundingBoxClipper } from '@cognite/reveal';

CameraControls.install({ THREE });

async function main() {
  const { project, modelUrl, modelRevision } = getParamsFromURL({ project: 'publicdata', modelUrl: 'primitives' });
  const client = new CogniteClient({ appId: 'reveal.example.simple' });
  client.loginWithOAuth({ project });

  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const coverageUtil = new reveal.internal.GpuOrderSectorsByVisibilityCoverage();
  const sectorCuller = new reveal.internal.ByVisibilityGpuSectorCuller({
    coverageUtil,
    costLimit: 70 * 1024 * 1024,
    logCallback: console.log
  });
  const debugCanvas = coverageUtil.createDebugCanvas({ width: 160, height: 100 });
  debugCanvas.style.position = 'fixed';
  debugCanvas.style.left = '8px';
  debugCanvas.style.top = '8px';
  document.body.appendChild(debugCanvas);
  const revealManager: reveal.RenderManager = createRenderManager(
    modelRevision !== undefined ? 'cdf' : 'local',
    client,
    {
      internal: { sectorCuller }
    }
  );

  let model: reveal.CadNode;
  if (revealManager instanceof reveal.LocalHostRevealManager && modelUrl !== undefined) {
    model = await revealManager.addModel('cad', modelUrl);
  } else if (revealManager instanceof reveal.RevealManager && modelRevision !== undefined) {
    model = await revealManager.addModel('cad', modelRevision);
  } else {
    throw new Error('Need to provide either project & model OR modelUrl as query parameters');
  }
  scene.add(model);

  const { position, target, near, far } = model.suggestCameraConfig();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far);
  const controls = new CameraControls(camera, renderer.domElement);
  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();
  revealManager.update(camera);

  const params = {
    clipIntersection: false,
    width: 670,
    height: 1010,
    depth: 200,
    x: 0,
    y: 0,
    z: 0,
    showHelpers: false
  };

  let planesNeedUpdate = true;

  const boxClipper = new BoundingBoxClipper(
    new THREE.Box3(
      new THREE.Vector3(params.x - params.width / 2, params.y - params.height / 2, params.z - params.depth / 2),
      new THREE.Vector3(params.x + params.width / 2, params.y + params.height / 2, params.z + params.depth / 2)
    ),
    params.clipIntersection
  );

  revealManager.clippingPlanes = boxClipper.clippingPlanes;
  revealManager.clipIntersection = boxClipper.intersection;
  renderer.localClippingEnabled = true;
  // renderer.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.0)];

  const helpers = new THREE.Group();
  helpers.add(new THREE.PlaneHelper(boxClipper.clippingPlanes[0], 2, 0xff0000));
  helpers.add(new THREE.PlaneHelper(boxClipper.clippingPlanes[1], 2, 0xff0000));
  helpers.add(new THREE.PlaneHelper(boxClipper.clippingPlanes[2], 2, 0x00ff00));
  helpers.add(new THREE.PlaneHelper(boxClipper.clippingPlanes[3], 2, 0x00ff00));
  helpers.add(new THREE.PlaneHelper(boxClipper.clippingPlanes[4], 2, 0x0000ff));
  helpers.add(new THREE.PlaneHelper(boxClipper.clippingPlanes[5], 2, 0x0000ff));
  // helpers.visible = false;
  scene.add(helpers);

  const clock = new THREE.Clock();
  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    if (controlsNeedUpdate) {
      revealManager.update(camera);
    }

    if (controlsNeedUpdate || revealManager.needsRedraw || planesNeedUpdate) {
      renderer.render(scene, camera);
      planesNeedUpdate = false;
      revealManager.resetRedraw();
    }

    requestAnimationFrame(render);
  };
  render();

  const gui = new dat.GUI();

  gui
    .add(params, 'clipIntersection')
    .name('clip intersection')
    .onChange(value => {
      revealManager.clipIntersection = value;
      boxClipper.intersection = value;
      planesNeedUpdate = true;
    });

  gui
    .add(params, 'x', -600, 600)
    .step(0.1)
    .name('x')
    .onChange(_ => {
      boxClipper.minX = params.x - params.width / 2;
      boxClipper.maxX = params.x + params.width / 2;
      planesNeedUpdate = true;
    });

  gui
    .add(params, 'y', -600, 600)
    .step(0.1)
    .name('y')
    .onChange(_ => {
      boxClipper.minY = params.y - params.height / 2;
      boxClipper.maxY = params.y + params.height / 2;
      planesNeedUpdate = true;
    });

  gui
    .add(params, 'z', -600, 600)
    .step(0.1)
    .name('z')
    .onChange(_ => {
      boxClipper.minZ = params.z - params.depth / 2;
      boxClipper.maxZ = params.z + params.depth / 2;
      planesNeedUpdate = true;
    });

  gui
    .add(params, 'width', 0, 10000)
    .step(0.1)
    .name('width')
    .onChange(_ => {
      boxClipper.minX = params.x - params.width / 2;
      boxClipper.maxX = params.x + params.width / 2;
      planesNeedUpdate = true;
    });

  gui
    .add(params, 'height', 0, 10000)
    .step(0.1)
    .name('height')
    .onChange(_ => {
      boxClipper.minY = params.y - params.height / 2;
      boxClipper.maxY = params.y + params.height / 2;
      planesNeedUpdate = true;
    });

  gui
    .add(params, 'depth', 0, 10000)
    .step(0.1)
    .name('depth')
    .onChange(_ => {
      boxClipper.minZ = params.z - params.depth / 2;
      boxClipper.maxZ = params.z + params.depth / 2;
      planesNeedUpdate = true;
    });

  gui
    .add(params, 'showHelpers')
    .name('show helpers')
    .onChange(_ => {
      // helpers.visible = value;
      planesNeedUpdate = true;
    });

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
}

main();
