/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { ComboControls } from '../src/ComboControls';
import Keyboard from '../src/Keyboard';

let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let controls: ComboControls;
let sphere: THREE.Mesh;
let keyboard: Keyboard;
let currentControlsState: {
  position: THREE.Vector3;
  target: THREE.Vector3;
};

init();

function init() {
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000000);

  scene = new THREE.Scene();

  const grid = new THREE.GridHelper(40, 40);
  scene.add(grid);

  const geometry = new THREE.BoxGeometry(10, 10, 10);
  const material = new THREE.MeshNormalMaterial();

  const sphereGeometry = new THREE.SphereGeometry(1);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: 'green' });
  sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 5, 0);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(render);

  keyboard = new Keyboard();
  keyboard.addEventListeners(renderer.domElement);

  controls = new ComboControls(camera, renderer.domElement);

  controls.options = {
    dynamicTarget: true,
    minDistance: 0.1,
    enableDamping: true,
    dampingFactor: 0.2
  };
  controls.enabled = true;

  controls.setState(new THREE.Vector3(0, 20, 20), new THREE.Vector3());

  sphere.position.copy(controls.getState().target);

  document.body.appendChild(renderer.domElement);
}

function render(deltaTimeS: number) {
  currentControlsState = controls.getState();

  if (keyboard.isPressed('KeyC')) {
    controls.setState(currentControlsState.position, currentControlsState.target.add(new THREE.Vector3(-0.1, 0, 0)));
  }
  if (keyboard.isPressed('KeyB')) {
    controls.setState(currentControlsState.position, currentControlsState.target.add(new THREE.Vector3(0.1, 0, 0)));
  }
  if (keyboard.isPressed('KeyF')) {
    controls.setState(currentControlsState.position, currentControlsState.target.copy(new THREE.Vector3(3, 2, 0)));
  }

  controls.update(deltaTimeS);
  sphere.position.copy(controls.getState().target);
  renderer.render(scene, camera);
}
