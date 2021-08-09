/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import GLTFInstancingPlugin from '../src/GLTFInstancingPlugin';

init();

function init() {
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);

  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const grid = new THREE.GridHelper(5, 20);
  scene.add(grid);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshNormalMaterial();

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0.5, 0);
  scene.add(mesh);

  const loader = new GLTFLoader();
  loader.register(parser => new GLTFInstancingPlugin(parser));
  loader.load('sample-models/testScene.glb', _ => {
    // gltf.scene.traverse(obj => {
    //   console.log(obj.name);
    // });
    //scene.add(gltf.scene);
  });

  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.set(3, 3, 3);
  controls.target.set(0, 0, 0);
  controls.update();

  document.body.appendChild(renderer.domElement);

  renderer.setAnimationLoop(_ => {
    controls.update();
    renderer.render(scene, camera);
  });
}
