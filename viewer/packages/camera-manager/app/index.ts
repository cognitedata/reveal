/*!
 * Copyright 2021 Cognite AS
 */
import {
  BoxGeometry,
  GridHelper,
  Mesh,
  MeshBasicMaterial,
  MeshNormalMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer
} from 'three';
import { ComboControls } from '../src/ComboControls';
import Keyboard from '../src/Keyboard';

let renderer: WebGLRenderer;
let camera: PerspectiveCamera;
let scene: Scene;
let controls: ComboControls;
let sphere: Mesh;
let keyboard: Keyboard;
let currentControlsState: {
  position: Vector3;
  target: Vector3;
};

init();

function init() {
  camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000000);

  scene = new Scene();

  const grid = new GridHelper(40, 40);
  scene.add(grid);

  const geometry = new BoxGeometry(10, 10, 10);
  const material = new MeshNormalMaterial();

  const sphereGeometry = new SphereGeometry(1);
  const sphereMaterial = new MeshBasicMaterial({ color: 'green' });
  sphere = new Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);

  const mesh = new Mesh(geometry, material);
  mesh.position.set(0, 5, 0);
  scene.add(mesh);

  renderer = new WebGLRenderer({ antialias: true });
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

  controls.setState(new Vector3(0, 20, 20), new Vector3());

  sphere.position.copy(controls.getState().target);

  document.body.appendChild(renderer.domElement);
}

function render(deltaTimeS: number) {
  currentControlsState = controls.getState();

  if (keyboard.isPressed('KeyC')) {
    controls.setState(currentControlsState.position, currentControlsState.target.add(new Vector3(-0.1, 0, 0)));
  }
  if (keyboard.isPressed('KeyB')) {
    controls.setState(currentControlsState.position, currentControlsState.target.add(new Vector3(0.1, 0, 0)));
  }
  if (keyboard.isPressed('KeyF')) {
    controls.setState(currentControlsState.position, currentControlsState.target.copy(new Vector3(3, 2, 0)));
  }

  controls.update(deltaTimeS);
  sphere.position.copy(controls.getState().target);
  renderer.render(scene, camera);
}
