/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import * as reveal from '@cognite/reveal';
import * as reveal_threejs from '@cognite/reveal/threejs';
import { CogniteClient } from '@cognite/sdk';
import { CadNode } from '@cognite/reveal/threejs';
import { Vector3, MOUSE } from 'three';
import { GUI } from 'dat.gui';

CameraControls.install({ THREE });

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

  const { htmlElement, paragraph } = createHtmlElements();
  document.body.appendChild(htmlElement);

  let pickingNeedsUpdate = false;
  const pickedNodes: Set<number> = new Set();
  const shading = reveal_threejs.createDefaultShading({
    color(treeIndex: number) {
      if (pickedNodes.has(treeIndex)) {
        return [255, 255, 0, 255];
      }
      return undefined;
    }
  });

  const scene = new THREE.Scene();
  const cadNode = new CadNode(cadModel, { shading });
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

    if (controlsNeedUpdate || sectorsNeedUpdate || pickingNeedsUpdate) {
      renderer.render(scene, camera);
    }
    if (controlsNeedUpdate || updateUI) {
      updateUI = false;
      const { x, y } = reveal.worldToViewport(canvas, camera, worldPosition);
      htmlElement.style.top = `${y}px`;
      htmlElement.style.left = `${x}px`;
    }

    requestAnimationFrame(render);
  };

  const pick = (event: MouseEvent) => {
    if (event.button === MOUSE.RIGHT) {
      return;
    }
    const rect = renderer.domElement.getBoundingClientRect();
    const coords = {
      x: ((event.clientX - rect.left) / renderer.domElement.clientWidth) * 2 - 1,
      y: ((event.clientY - rect.top) / renderer.domElement.clientHeight) * -2 + 1
    };
    // Pick in Reveal
    const revealPickResult = (() => {
      const intersections = reveal_threejs.intersectCadNodes([cadNode], { renderer, camera, coords });
      if (intersections.length === 0) {
        return;
      }

      // scene.add(createSphere(intersections[0]!.point, 'purple'));

      return intersections[0];
    })();
    const treeIndex = revealPickResult!.treeIndex;
    paragraph.textContent = `treeIndex: ${treeIndex}`;
    if (!pickedNodes.has(treeIndex)) {
      pickedNodes.add(treeIndex);
    } else {
      pickedNodes.delete(treeIndex);
    }
    shading.updateNodes([treeIndex]);
    pickingNeedsUpdate = true;
  };
  renderer.domElement.addEventListener('mousedown', pick);

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
function createHtmlElements() {
  const htmlElement = document.createElement('div');
  const style = htmlElement.style;
  style.position = 'absolute';
  style.pointerEvents = 'none';
  style.top = '0';
  style.left = '0';
  style.zIndex = '1';
  style.marginLeft = '5px';
  style.marginTop = '5px';
  style.padding = '15px';
  style.width = '220px';
  style.color = '#fff';
  style.background = '#232323da';
  style.borderRadius = '0.5em';
  style.transition = 'opacity .5s';

  const paragraph = document.createElement('p');
  paragraph.textContent = 'Hello there, I am an example paragraph.';
  htmlElement.appendChild(paragraph);

  htmlElement.className = 'htmlOverlay';
  return { htmlElement, paragraph };
}

main();
