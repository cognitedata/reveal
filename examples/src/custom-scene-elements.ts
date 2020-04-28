/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import * as reveal from '@cognite/reveal';
import * as reveal_threejs from '@cognite/reveal/threejs';

import CameraControls from 'camera-controls';
import { createPathNode, createTextSpriteNode } from './utils/scene-elements';
import { getParamsFromURL } from './utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import { SimpleRevealManager, CadNode } from '@cognite/reveal/threejs';

CameraControls.install({ THREE });

/**
 * This example combines uses html2canvas (https://html2canvas.hertzen.com/) to embed a
 * DOM element through a Canvas in ThreeJS.
 */
async function main() {
  const { project, modelUrl, modelRevision } = getParamsFromURL({ project: 'publicdata', modelUrl: 'ivar-aasen' });
  const client = new CogniteClient({ appId: 'reveal.example.custom-scene' });
  client.loginWithOAuth({ project });

  const scene = new THREE.Scene();
  let sectorsNeedUpdate = true;
  const revealManager = new SimpleRevealManager(client, () => {
    sectorsNeedUpdate = true;
  });
  let model: CadNode;
  if (modelUrl) {
    model = await revealManager.addModelFromUrl(modelUrl);
  } else if (modelRevision) {
    model = await revealManager.addModelFromCdf(modelRevision);
  } else {
    throw new Error('Need to provide either project & model OR modelUrl as query parameters');
  }
  scene.add(model);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 10000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#000000');
  renderer.setSize(window.innerWidth, window.innerHeight);

  const controls = new CameraControls(camera, renderer.domElement);
  const pos = new THREE.Vector3(100, 100, 100);
  const target = new THREE.Vector3(0, 0, 0);
  controls.setLookAt(pos.x, pos.y, pos.z, target.x, target.y, target.z);
  controls.update(0.0);

  // Some custom content
  const path = [
    new THREE.Vector3(8.58, 0.62, -2.32),
    new THREE.Vector3(7.96, 0.62, -9.86),
    new THREE.Vector3(10.62, 0.62, -9.86),
    new THREE.Vector3(11.06, 0.62, -7.2)
  ];
  const pathNode = createPathNode(path);
  scene.add(pathNode);

  const spriteDefinitions = [
    { pos: new THREE.Vector3(8.58, 0.62, -2.32), text: 'R-AB-98' },
    { pos: new THREE.Vector3(10.62, 0.62, -9.86), text: 'K-CC-12' },
    { pos: new THREE.Vector3(11.06, 0.62, -7.2), text: 'R-MN-42' }
  ];
  const textSpritesNdoe = createTextSpriteNode(spriteDefinitions);
  scene.add(textSpritesNdoe);

  // Render loop
  const clock = new THREE.Clock();
  const render = () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);

    if (controlsNeedUpdate) {
      revealManager.update(camera);
    }

    if (controlsNeedUpdate || sectorsNeedUpdate) {
      renderer.render(scene, camera);
    }

    TWEEN.update();

    requestAnimationFrame(render);
  };
  render();

  document.body.appendChild(renderer.domElement);
  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
}

main();
