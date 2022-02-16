/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { GltfSectorParser } from '../src/GltfSectorParser';
import { RevealGeometryCollectionType } from '../src/types';
import * as TestMaterials from './testMaterials';

init();

function fitCameraToBoundingBox(
  box: THREE.Box3,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  radiusFactor: number = 2
): void {
  const center = new THREE.Vector3().lerpVectors(box.min, box.max, 0.5);
  const radius = 0.5 * new THREE.Vector3().subVectors(box.max, box.min).length();
  const boundingSphere = new THREE.Sphere(center, radius);

  const target = boundingSphere.center;
  const distance = boundingSphere.radius * radiusFactor;
  const direction = new THREE.Vector3(0, 0, -1);
  direction.applyQuaternion(camera.quaternion);

  const position = new THREE.Vector3();
  position.copy(direction).multiplyScalar(-distance).add(target);

  camera.position.copy(position);
  controls.target.copy(target);
}

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
  group.frustumCulled = false;
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
  const sceneJsonUrl = 'test-models/anders-test-draco/';

  const sceneJson = await (await fetch(sceneJsonUrl + 'scene.json')).json();

  const sectors = sceneJson.sectors as [
    {
      sectorFileName: string;
      boundingBox: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } };
    }
  ];

  const min = sectors[0].boundingBox.min;
  const max = sectors[0].boundingBox.max;

  const boundingBox = new THREE.Box3(new Vector3(min.x, min.y, min.z), new Vector3(max.x, max.y, max.z));
  boundingBox.applyMatrix4(cadFromCdfToThreeMatrix);

  const fileNames = sectors.map(p => p.sectorFileName);

  await Promise.all(
    fileNames.map(fileName =>
      fetch(sceneJsonUrl + fileName)
        .then(file => file.blob())
        .then(blob => blob.arrayBuffer())
    )
  ).then(buffers => {
    buffers.forEach(async element => {
      const geometries = await loader.parseSector(element);
      geometries.forEach(result => {
        const material = materialMap.get(result.type)!;

        const mesh = new THREE.Mesh(result.geometryBuffer, material);
        mesh.frustumCulled = false;
        mesh.onBeforeRender = () => {
          (material.uniforms.inverseModelMatrix?.value as THREE.Matrix4)?.copy(mesh.matrixWorld).invert();
          (material.uniforms.modelMatrix?.value as THREE.Matrix4)?.copy(mesh.matrixWorld);
          (material.uniforms.viewMatrix?.value as THREE.Matrix4)?.copy(camera.matrixWorld).invert();
          (material.uniforms.projectionMatrix?.value as THREE.Matrix4)?.copy(camera.projectionMatrix);
          (material.uniforms.normalMatrix?.value as THREE.Matrix3)?.copy(mesh.normalMatrix);
          (material.uniforms.cameraPosition?.value as THREE.Vector3)?.copy(camera.position);
        };
        group.add(mesh);
      });
    });
  });

  console.log(scene);

  const controls = new OrbitControls(camera, renderer.domElement);

  fitCameraToBoundingBox(boundingBox, camera, controls, 2);

  controls.update();

  document.body.appendChild(renderer.domElement);

  renderer.domElement.style.backgroundColor = '#000000';

  renderer.setAnimationLoop(_ => {
    controls.update();
    renderer.render(scene, camera);
  });
}
