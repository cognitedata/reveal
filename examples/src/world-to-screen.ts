/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { CadNode, NodeAppearance, HtmlOverlayHelper, intersectCadNodes } from '@cognite/reveal/threejs';
import { createModelIdentifierFromUrlParams, loadCadModelFromCdfOrUrl, createClientIfNecessary } from './utils/loaders';
import { MOUSE } from 'three';

CameraControls.install({ THREE });

async function main() {
  const urlParams = new URL(location.href).searchParams;
  const modelIdentifier = createModelIdentifierFromUrlParams(urlParams, '/primitives');
  const apiKey = urlParams.get('apiKey');

  const scene = new THREE.Scene();
  const cadModel = await loadCadModelFromCdfOrUrl(
    modelIdentifier,
    await createClientIfNecessary(modelIdentifier, apiKey)
  );

  let pickingNeedsUpdate = false;
  let pickedNode: number | undefined;
  const nodeAppearance: NodeAppearance = {
    color(treeIndex: number) {
      if (treeIndex === pickedNode) {
        return [0, 255, 255, 255];
      }
      return undefined;
    }
  };

  const cadNode = new CadNode(cadModel, { nodeAppearance });
  let modelNeedsUpdate = false;
  cadNode.addEventListener('update', () => {
    modelNeedsUpdate = true;
  });
  scene.add(cadNode);

  const renderer = new THREE.WebGLRenderer();
  const canvas = renderer.domElement;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(canvas);

  const { position, target, near, far } = cadNode.suggestCameraConfig();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far);
  const controls = new CameraControls(camera, renderer.domElement);

  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();
  cadNode.update(camera);

  const { htmlElement, paragraph } = createHtmlElements();
  document.body.appendChild(htmlElement);
  const htmlOverlayHelper = new HtmlOverlayHelper();

  const clock = new THREE.Clock();
  const render = () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    if (controlsNeedUpdate) {
      cadNode.update(camera);
    }

    if (controlsNeedUpdate || modelNeedsUpdate || pickingNeedsUpdate) {
      renderer.render(scene, camera);
      htmlOverlayHelper.updatePositions(renderer, camera);
    }
    requestAnimationFrame(render);
  };

  const onLeftMouseDown = (event: MouseEvent) => {
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
      const intersections = intersectCadNodes([cadNode], { renderer, camera, coords });
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
      cadNode.requestNodeUpdate(updatedNodes);
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
