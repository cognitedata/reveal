/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { RevealGlbParser } from '../src/RevealGlbParser';
import { RevealGeometryCollectionType } from '../src/types';
import * as TestMaterials from './testMaterials';

init();

async function init() {
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000);

  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const grid = new THREE.GridHelper(30, 40);
  grid.position.set(14, -1, -14);
  scene.add(grid);

  const cadFromCdfToThreeMatrix = new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);
  const group = new THREE.Group();
  group.applyMatrix4(cadFromCdfToThreeMatrix);
  scene.add(group);

  const materialMap: Map<RevealGeometryCollectionType, THREE.ShaderMaterial> = new Map([
    [RevealGeometryCollectionType.BoxCollection, TestMaterials.createBoxMaterial()],
    [RevealGeometryCollectionType.CircleCollection, TestMaterials.createCircleMaterial()],
    [RevealGeometryCollectionType.ConeCollection, TestMaterials.createConeMaterial()],
    [RevealGeometryCollectionType.EccentricConeCollection, TestMaterials.createEccentricConeMaterial()],
    [RevealGeometryCollectionType.EllipsoidSegmentCollection, TestMaterials.createEllipsoidSegmentMaterial()],
    [RevealGeometryCollectionType.GeneralCylinderCollection, TestMaterials.createGeneralCylinderMaterial()],
    [RevealGeometryCollectionType.GeneralRingCollection, TestMaterials.createGeneralRingMaterial()],
    [RevealGeometryCollectionType.QuadCollection, TestMaterials.createQuadMaterial()],
    [RevealGeometryCollectionType.TorusSegmentCollection, TestMaterials.createTorusSegmentMaterial()],
    [RevealGeometryCollectionType.TrapeziumCollection, TestMaterials.createTrapeziumMaterial()],
    [RevealGeometryCollectionType.NutCollection, TestMaterials.createNutMaterial()],
    [RevealGeometryCollectionType.TriangleMesh, TestMaterials.createTriangleMeshMaterial()],
    [RevealGeometryCollectionType.InstanceMesh, TestMaterials.createInstancedMeshMaterial()]
  ]);

  const loader = new RevealGlbParser();

  const sceneJson = await (await fetch('test-models/scene.json')).json();

  const sectors = sceneJson.sectors as [{ sectorFileName: string }];

  const fileNames = sectors.map(p => p.sectorFileName);

  await Promise.all(
    fileNames.map(fileName =>
      fetch(`test-models/` + fileName)
        .then(file => file.blob())
        .then(blob => blob.arrayBuffer())
    )
  ).then(buffers => {
    buffers.forEach(element => {
      const geometries = loader.parseSector(element);
      geometries.forEach(result => {
        const material = materialMap.get(result.type)!;
        const mesh = new THREE.Mesh(result.buffer, material);
        mesh.frustumCulled = false;
        mesh.onBeforeRender = () => {
          const inverseModelMatrix: THREE.Matrix4 = material.uniforms.inverseModelMatrix.value;
          inverseModelMatrix.copy(mesh.matrixWorld).invert();
        };
        group.add(mesh);
      });
    });
  });

  const controls = new OrbitControls(camera, renderer.domElement);
  const target = new THREE.Vector3(10, 0, 0);
  camera.position.add(new THREE.Vector3(10, 20, 20));
  controls.target.copy(target);
  controls.update();

  document.body.appendChild(renderer.domElement);

  renderer.setAnimationLoop(_ => {
    controls.update();
    renderer.render(scene, camera);
  });
}
