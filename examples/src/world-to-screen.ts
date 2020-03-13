/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import * as reveal from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';
import { CadNode } from '@cognite/reveal/threejs';
import { Vector3 } from 'three';
import { GUI } from 'dat.gui';

CameraControls.install({ THREE });

// Want to split the logic away from THREE at some point.
function project3DPositionTo2DPlane(
  canvas: HTMLCanvasElement,
  camera: THREE.PerspectiveCamera,
  position3D: THREE.Vector3
): { x: number; y: number } {
  const vector = position3D.clone();
  vector.project(camera);
  vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
  vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));

  return { x: vector.x, y: vector.y };
}

async function main() {
  const url = new URL(location.href);
  const project = url.searchParams.get('projectId') || 'publicdata';
  const modelId = parseInt(url.searchParams.get('modelId') || '0', 10);
  const client: CogniteClient = new CogniteClient({ appId: 'Reveal Examples - World To Screen' });
  client.loginWithOAuth({
    project
  });

  const cadModel = await reveal.loadCadModelFromCdf(client, modelId);

  const renderer = new THREE.WebGLRenderer();
  const canvas = renderer.domElement;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(canvas);

  const htmlElement = createHtmlElement();
  document.body.appendChild(htmlElement);

  const scene = new THREE.Scene();
  const cadNode = new CadNode(cadModel);
  const { position, target, near, far } = cadNode.suggestCameraConfig();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far);
  const controls = new CameraControls(camera, renderer.domElement);

  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();
  scene.add(cadNode);

  let updateUI = true;
  const worldPosition: Vector3 = new Vector3(0, 0, 0);
  createGUI(worldPosition, htmlElement, () => {
    updateUI = true;
  });
  const clock = new THREE.Clock();
  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    const sectorsNeedUpdate = await cadNode.update(camera);

    if (controlsNeedUpdate || sectorsNeedUpdate) {
      renderer.render(scene, camera);
    }
    if (controlsNeedUpdate || updateUI) {
      updateUI = false;
      const { x, y } = project3DPositionTo2DPlane(canvas, camera, worldPosition);
      htmlElement.style.top = `${y}px`;
      htmlElement.style.left = `${x}px`;
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

function createGUI(position: Vector3, htmlElement: HTMLElement, guiUpdated: () => void) {
  const gui = new GUI({ width: 300 });
  gui.add(position, 'x').onChange(guiUpdated);
  gui.add(position, 'y').onChange(guiUpdated);
  gui.add(position, 'z').onChange(guiUpdated);
  gui.addColor(htmlElement.style, 'background').onChange(guiUpdated);
}

// Since we don't have a good way to link css to examples I added a way of creating the demo html element.
function createHtmlElement() {
  const htmlElement = document.createElement('div');
  const style = htmlElement.style;
  style.position = 'absolute';
  style.top = '0';
  style.left = '0';
  style.zIndex = '1';
  style.marginLeft = '0px';
  style.marginTop = '0px';
  style.width = '10px';
  style.height = '10px';
  style.color = '#fff';
  style.background = '#ce0024ff';
  style.borderRadius = '2em';
  style.transition = 'opacity .5s';

  htmlElement.className = 'htmlOverlay';
  return htmlElement;
}

main();
