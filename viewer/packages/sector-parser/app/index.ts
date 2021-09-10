/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { GltfSectorParser, RevealGeometryCollectionType } from '../';
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

  const loader = new GltfSectorParser();

  const domParser = new DOMParser();
  const response = await (await fetch(`test-models/`)).text();
  const doc = domParser.parseFromString(response, 'text/html');

  const elems = doc.getElementsByClassName('name');

  const fileNames: string[] = [];
  for (let i = 0; i < elems.length; i++) {
    const name = elems.item(i)!.innerHTML;
    if (name.endsWith('.glb')) {
      fileNames.push(name);
    }
  }

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
        const material = materialMap.get(result[0])!;
        const mesh = new THREE.Mesh(result[1], material);
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
  // camera.position.add(new THREE.Vector3(10, 20, 20));
  camera.position.add(new THREE.Vector3(400, 800, -800));
  controls.target.copy(target);
  controls.update();

  document.body.appendChild(renderer.domElement);

  renderer.setAnimationLoop(_ => {
    controls.update();
    renderer.render(scene, camera);
  });
}
