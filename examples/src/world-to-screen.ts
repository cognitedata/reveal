/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import * as reveal from '@cognite/reveal/experimental';
import { getParamsFromURL } from './utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';

CameraControls.install({ THREE });

async function main() {
  const { project, modelUrl, modelRevision } = getParamsFromURL({ project: 'publicdata', modelUrl: 'primitives' });
  const client = new CogniteClient({ appId: 'reveal.example.world-to-screen' });
  client.loginWithOAuth({ project });

  let pickingNeedsUpdate = false;
  let pickedNode: number | undefined;

  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer();
  const canvas = renderer.domElement;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(canvas);

  let modelsNeedUpdate = true;
  const revealManager = new reveal.RevealManager(client, () => {
    modelsNeedUpdate = true;
  });

  const nodeAppearance: reveal.ModelNodeAppearance = {
    color(treeIndex: number) {
      if (treeIndex === pickedNode) {
        return [0, 255, 255, 255];
      }
      return undefined;
    }
  };
  let model: reveal.CadNode;
  if (modelUrl) {
    model = await revealManager.addModelFromUrl(modelUrl, nodeAppearance);
  } else if (modelRevision) {
    model = await revealManager.addModelFromCdf(modelRevision, nodeAppearance);
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

  const { htmlElement, paragraph } = createHtmlElements();
  document.body.appendChild(htmlElement);
  const htmlOverlayHelper = new reveal.utilities.HtmlOverlayHelper();

  const clock = new THREE.Clock();
  const render = () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    if (controlsNeedUpdate) {
      revealManager.update(camera);
    }

    if (controlsNeedUpdate || modelsNeedUpdate || pickingNeedsUpdate) {
      renderer.render(scene, camera);
      htmlOverlayHelper.updatePositions(renderer, camera);
    }
    requestAnimationFrame(render);
  };

  const onLeftMouseDown = (event: MouseEvent) => {
    if (event.button === THREE.MOUSE.RIGHT) {
      return;
    }
    const rect = renderer.domElement.getBoundingClientRect();
    const coords = {
      x: ((event.clientX - rect.left) / renderer.domElement.clientWidth) * 2 - 1,
      y: ((event.clientY - rect.top) / renderer.domElement.clientHeight) * -2 + 1
    };
    // Pick in Reveal
    const revealPickResult = (() => {
      const intersections = reveal.intersectCadNodes([model], { renderer, camera, coords });
      if (intersections.length === 0) {
        return;
      }
      return intersections[0];
    })();
    const treeIndex = revealPickResult ? revealPickResult.treeIndex : undefined;
    if (pickedNode !== treeIndex) {
      const oldNode = pickedNode;
      const text = `treeIndex: ${treeIndex}`;
      pickedNode = treeIndex;
      const updatedNodes = [];
      if (oldNode) {
        updatedNodes.push(oldNode);
      }
      if (pickedNode) {
        updatedNodes.push(pickedNode);
        htmlOverlayHelper.addOverlayElement(htmlElement, revealPickResult!.point);
        paragraph.textContent = text;
        htmlElement.style.display = 'block';
      } else {
        htmlOverlayHelper.removeOverlayElement(htmlElement);
        htmlElement.style.display = 'none';
      }
      model.requestNodeUpdate(updatedNodes);
      pickingNeedsUpdate = true;
    }
  };
  renderer.domElement.addEventListener('mousedown', onLeftMouseDown);

  requestAnimationFrame(render);
  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
  (window as any).renderer = renderer;
}

// Since we don't have a good way to link css to examples I added a way of creating the demo html element.
function createHtmlElements() {
  const htmlElement = document.createElement('div');
  const style = htmlElement.style;
  style.display = 'none';
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
  htmlElement.appendChild(paragraph);

  htmlElement.className = 'htmlOverlay';
  return { htmlElement, paragraph };
}

main();
