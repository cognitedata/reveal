import * as THREE from 'three';
import ComboControls from "../";

let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let controls: ComboControls;
let sphere: THREE.Mesh;

init();

function init() {
  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
  
	scene = new THREE.Scene();
  
  const grid = new THREE.GridHelper(5, 20);
  scene.add(grid);
  
	const geometry = new THREE.BoxGeometry( 1, 1, 1 );
	const material = new THREE.MeshNormalMaterial ();

  const sphereGeometry = new THREE.SphereGeometry(0.1);
  const sphereMaterial = new THREE.MeshBasicMaterial({color: 'green'});
  sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);
  
	const mesh = new THREE.Mesh( geometry, material );
  mesh.position.set(0, 0.5, 0);
	scene.add( mesh );
  
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( render );

  controls = new ComboControls(camera, renderer.domElement);
  controls.enabled = true;

  controls.setState(new THREE.Vector3(0, 2, 2), new THREE.Vector3());

  sphere.position.copy(controls.getState().target);

	document.body.appendChild( renderer.domElement );

}

function render(time: number) {
  controls.update(time);
  sphere.position.copy(controls.getState().target);
	renderer.render( scene, camera );
}