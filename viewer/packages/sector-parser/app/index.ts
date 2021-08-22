/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { Vector3 } from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { sectorShaders } from '../../../core/src/datamodels/cad/rendering/shaders';
import GltfSectorLoader, { PrimitiveCollection } from '../src/GltfInstancingPlugin';

init();

function init() {
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1000, 10000);

  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const grid = new THREE.GridHelper(4000, 28);
  grid.position.set(-1800, -125, -600);
  scene.add(grid);

  const cadFromCdfToThreeMatrix = new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);
  const group = new THREE.Group();
  group.applyMatrix4(cadFromCdfToThreeMatrix);
  scene.add(group);

  const materialMap: Map<PrimitiveCollection, () => THREE.ShaderMaterial> = new Map([
    [PrimitiveCollection.BoxCollection, createBoxMaterial],
    [PrimitiveCollection.CircleCollection, createCircleMaterial],
    [PrimitiveCollection.ConeCollection, createConeMaterial]
  ]);

  const loader = new GltfSectorLoader();
  loader.loadSector('test2.glb').then(geometries => {
    geometries.forEach(result => {
      const material = materialMap.get(result[0])!();
      const mesh = new THREE.InstancedMesh(result[1], material, 2);
      mesh.frustumCulled = false;
      mesh.onBeforeRender = () => {
        const inverseModelMatrix: THREE.Matrix4 = material.uniforms.inverseModelMatrix.value;
        inverseModelMatrix.copy(mesh.matrixWorld).invert();
      };
      group.add(mesh);
    });
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

function createCircleMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'Primitives (Circle)',
    clipping: false,
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.circlePrimitive.vertex,
    fragmentShader: sectorShaders.circlePrimitive.fragment,
    side: THREE.DoubleSide,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      }
    }
  });
}

function createConeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'Primitives (Cone)',
    clipping: false,
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.conePrimitive.vertex,
    fragmentShader: sectorShaders.conePrimitive.fragment,
    side: THREE.DoubleSide,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      }
    }
  });
}
