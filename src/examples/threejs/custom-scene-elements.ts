/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

import CameraControls from 'camera-controls';
import { createThreeJsSectorNode } from '../../views/threejs/sector/createThreeJsSectorNode';
import { createLocalSectorModel } from '../..';
import { createPathNode, createTextSpriteNode } from './utils/scene-elements';

import svennArneImgUrl from '../***REMOVED***';
// const svennArneImgUrl = require('../***REMOVED***');

CameraControls.install({ THREE });

/**
 * This example combines uses html2canvas (https://html2canvas.hertzen.com/) to embed a
 * DOM element through a Canvas in ThreeJS.
 */
async function main() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.near = 0.5;
  camera.far = 10000;
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#000000');
  renderer.setSize(window.innerWidth, window.innerHeight);

  const sectorModel = createLocalSectorModel('/***REMOVED***');
  const sectorModelNode = await createThreeJsSectorNode(sectorModel);
  scene.add(sectorModelNode);

  const controls = new CameraControls(camera, renderer.domElement);
  const pos = new THREE.Vector3(373.2188407437061, 512.6270615748768, -126.18227676536418);
  const target = new THREE.Vector3(330.697021484375, 500.3190002441406, -84.89916229248047);
  controls.setLookAt(pos.x, pos.y, pos.z, target.x, target.y, target.z);
  controls.update(0.0);

  // // Add a rendered DOM element to the scene
  const svennArneTexture = new THREE.TextureLoader().load(svennArneImgUrl);
  const quad = new THREE.PlaneBufferGeometry(5, 5, 10, 10);
  const quadMaterial = new THREE.MeshBasicMaterial({
    map: svennArneTexture,
    side: THREE.DoubleSide
  });
  const quadMesh = new THREE.Mesh(quad, quadMaterial);
  quadMesh.rotateY(Math.PI / 2);
  quadMesh.position.set(348.84, 503.5, -91);
  scene.add(quadMesh);

  // Some custom content
  const path = [
    new THREE.Vector3(338.58, 500.62, -122.32),
    new THREE.Vector3(337.96, 500.62, -99.86),
    new THREE.Vector3(340.62, 500.62, -99.86),
    new THREE.Vector3(341.06, 500.62, -87.2)
  ];
  const pathNode = createPathNode(path);
  scene.add(pathNode);

  const spriteDefinitions = [
    { pos: new THREE.Vector3(338.58, 500.62, -122.32), text: 'R-AB-98' },
    { pos: new THREE.Vector3(340.62, 500.62, -99.86), text: 'K-CC-12' },
    { pos: new THREE.Vector3(341.06, 500.62, -87.2), text: 'R-MN-42' }
  ];
  const textSpritesNdoe = createTextSpriteNode(spriteDefinitions);
  scene.add(textSpritesNdoe);

  // Render loop
  const clock = new THREE.Clock();
  const render = () => {
    requestAnimationFrame(render);

    const delta = clock.getDelta();
    controls.update(delta);
    renderer.render(scene, camera);

    TWEEN.update();
  };
  render();

  document.body.appendChild(renderer.domElement);
  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
}

main();
