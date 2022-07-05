/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

import { SimpleVisualTestFixture } from '../../../test-utilities/src/visual-tests/test-fixtures/SimpleVisualTestFixture';
import { GltfSectorParser } from '../src/GltfSectorParser';
import { RevealGeometryCollectionType } from '../src/types';
import * as TestMaterials from './testMaterials';

class SectorParserTestApp extends SimpleVisualTestFixture {
  public async setup(_: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera): Promise<void> {
    const cadFromCdfToThreeMatrix = new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);
    const group = new THREE.Group();
    group.frustumCulled = false;
    group.applyMatrix4(cadFromCdfToThreeMatrix);
    scene.add(group);

    const materialMap: Map<RevealGeometryCollectionType, THREE.RawShaderMaterial> = new Map([
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
    const sceneJsonUrl = 'primitives/';

    const sceneJson = await (await fetch(sceneJsonUrl + 'scene.json')).json();

    const sectors = sceneJson.sectors as [
      {
        sectorFileName: string;
        boundingBox: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } };
      }
    ];

    const min = sectors[0].boundingBox.min;
    const max = sectors[0].boundingBox.max;

    const boundingBox = new THREE.Box3(new THREE.Vector3(min.x, min.y, min.z), new THREE.Vector3(max.x, max.y, max.z));
    boundingBox.applyMatrix4(cadFromCdfToThreeMatrix);

    const fileNames = sectors.map(p => p.sectorFileName);

    const blobs = await Promise.all(
      fileNames.map(fileName =>
        fetch(sceneJsonUrl + fileName)
          .then(file => file.blob())
          .then(blob => blob.arrayBuffer())
      )
    );

    await Promise.all(
      blobs.map(async element => {
        const geometries = await loader.parseSector(element);
        geometries.forEach(result => {
          const material = materialMap.get(result.type)!;

          const mesh = new THREE.Mesh(result.geometryBuffer, material);
          mesh.frustumCulled = false;
          mesh.onBeforeRender = () => {
            (material.uniforms.inverseModelMatrix?.value as THREE.Matrix4)?.copy(mesh.matrixWorld).invert();
            (material.uniforms.cameraPosition?.value as THREE.Vector3)?.copy(camera.position);
          };
          group.add(mesh);
        });
      })
    );
    this.fitCameraToBoundingBox(boundingBox, camera, 1.3);
    camera.position.setY(15);
    camera.lookAt(13.5, 0, -13.5);

    return Promise.resolve();
  }

  private fitCameraToBoundingBox(box: THREE.Box3, camera: THREE.PerspectiveCamera, radiusFactor: number = 2): void {
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
  }
}

const test = new SectorParserTestApp();
await test.run();

const render = () => {
  test.render();
  requestAnimationFrame(render);
};

render();
