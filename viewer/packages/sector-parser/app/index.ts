/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { Vector3 } from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { sectorShaders } from '../../../core/src/datamodels/cad/rendering/shaders';
import GltfSectorLoader from '../src/GltfInstancingPlugin';

init();

function init() {
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1000, 10000);

  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const grid = new THREE.GridHelper(5000, 28);
  grid.position.set(0, -1250, 0);
  scene.add(grid);

  const loader = new GltfSectorLoader();
  loader.loadSector('test.glb').then(geometry => {
    const mesh = new THREE.InstancedMesh(geometry, createBoxMaterial(), 2);
    mesh.frustumCulled = false;
    scene.add(mesh);
  });

  const controls = new OrbitControls(camera, renderer.domElement);
  const target = new THREE.Vector3(-375, -1125, 0);
  camera.position.copy(target);
  camera.position.add(new Vector3(1000, 1000, 1400));
  controls.target.copy(target);
  controls.update();

  document.body.appendChild(renderer.domElement);

  renderer.setAnimationLoop(_ => {
    controls.update();
    renderer.render(scene, camera);
  });
}

function createBoxMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'Primitives (Box)',
    clipping: false,
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.boxPrimitive.vertex,
    fragmentShader: sectorShaders.boxPrimitive.fragment,
    side: THREE.DoubleSide,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      }
    }
  });
}
