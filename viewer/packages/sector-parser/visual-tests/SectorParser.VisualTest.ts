/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

import { SimpleTestFixtureComponents, SimpleVisualTestFixture } from '../../../visual-tests';
import { GltfSectorParser } from '../src/GltfSectorParser';
import { RevealGeometryCollectionType } from '../src/types';
import * as TestMaterials from './testMaterials';

export default class SectorParserVisualTestFixture extends SimpleVisualTestFixture {
  public async setup(simpleTestFixtureComponents: SimpleTestFixtureComponents): Promise<void> {
    const { scene, camera, dataProviders } = simpleTestFixtureComponents;
    const { modelDataProvider, modelIdentifier, modelMetadataProvider } = dataProviders;

    const group = this.initializeGroup(scene);

    const loader = new GltfSectorParser();

    const gltfOutput = (await modelMetadataProvider.getModelOutputs(modelIdentifier)).find(
      output => output.format === 'gltf-directory'
    )!;
    const modelUri = await modelMetadataProvider.getModelUri(modelIdentifier, gltfOutput);
    const sceneJson = await modelDataProvider.getJsonFile(modelUri, 'scene.json');

    const materialMap = TestMaterials.getMaterialsMap((sceneJson.maxTreeIndex as number) + 1);

    const sectors = sceneJson.sectors as [
      {
        sectorFileName: string;
        boundingBox: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } };
      }
    ];

    const min = sectors[0].boundingBox.min;
    const max = sectors[0].boundingBox.max;

    const boundingBox = new THREE.Box3(new THREE.Vector3(min.x, min.y, min.z), new THREE.Vector3(max.x, max.y, max.z));
    boundingBox.applyMatrix4(this.cadFromCdfToThreeMatrix);

    const fileNames = sectors.map(sector => sector.sectorFileName);

    const blobs = await Promise.all(fileNames.map(fileName => modelDataProvider.getBinaryFile(modelUri, fileName)));

    await this.loadSectors(blobs, loader, materialMap, camera, group);

    this.fitCameraToBoundingBox(boundingBox, 1.3);

    return Promise.resolve();
  }

  private async loadSectors(
    blobs: ArrayBuffer[],
    loader: GltfSectorParser,
    materialMap: Map<RevealGeometryCollectionType, THREE.RawShaderMaterial>,
    camera: THREE.PerspectiveCamera,
    group: THREE.Group
  ) {
    return Promise.all(
      blobs.map(async element => {
        const geometries = await loader.parseSector(element);
        geometries.forEach(result => {
          if (result.type !== RevealGeometryCollectionType.GeneralCylinderCollection) {
            return;
          }
          const material = materialMap.get(result.type)!;

          const mesh = new THREE.Mesh(result.geometryBuffer, material);
          this.logAttributeData(mesh, group);
          mesh.frustumCulled = false;
          mesh.onBeforeRender = () => {
            (material.uniforms.inverseModelMatrix?.value as THREE.Matrix4)?.copy(mesh.matrixWorld).invert();
            (material.uniforms.cameraPosition?.value as THREE.Vector3)?.copy(camera.position);
          };
          group.add(mesh);
        });
      })
    );
  }

  logAttributeData(mesh: THREE.Mesh, group: THREE.Group, index = 0): void {
    console.log('a_centerA');
    const centerA = new THREE.Vector3(
      mesh.geometry.attributes.a_centerA.getX(index),
      mesh.geometry.attributes.a_centerA.getY(index),
      mesh.geometry.attributes.a_centerA.getZ(index)
    );
    console.log(centerA);
    createSphere(centerA);

    console.log('a_centerB');
    const centerB = new THREE.Vector3(
      mesh.geometry.attributes.a_centerB.getX(index),
      mesh.geometry.attributes.a_centerB.getY(index),
      mesh.geometry.attributes.a_centerB.getZ(index)
    );
    console.log(centerB);
    createSphere(centerB);

    console.log('a_planeA');
    const planeA = new THREE.Vector4(
      mesh.geometry.attributes.a_planeA.getX(index),
      mesh.geometry.attributes.a_planeA.getY(index),
      mesh.geometry.attributes.a_planeA.getZ(index),
      mesh.geometry.attributes.a_planeA.getW(index)
    );
    console.log(planeA);

    console.log('a_planeB');
    const planeB = new THREE.Vector4(
      mesh.geometry.attributes.a_planeB.getX(index),
      mesh.geometry.attributes.a_planeB.getY(index),
      mesh.geometry.attributes.a_planeB.getZ(index),
      mesh.geometry.attributes.a_planeB.getW(index)
    );
    console.log(planeB);

    console.log('a_localXAxis');
    const localXAxis = new THREE.Vector3(
      mesh.geometry.attributes.a_localXAxis.getX(index),
      mesh.geometry.attributes.a_localXAxis.getY(index),
      mesh.geometry.attributes.a_localXAxis.getZ(index)
    );
    console.log(localXAxis);

    console.log(mesh.geometry.attributes.a_angle.getX(index));
    console.log(mesh.geometry.attributes.a_arcAngle.getX(index));

    console.log(Object.keys(mesh.geometry.attributes));

    // const height = centerA.clone().sub(centerB).length();
    // console.log('Height: ' + height);
    // console.log('Half height: ' + height / 2);

    // const testA = planeA.w - planeB.w;
    // console.log('Test A: ' + testA);

    function createSphere(pos: THREE.Vector3) {
      const geom = new THREE.SphereGeometry(0.1, 10, 10);
      const mat = new THREE.MeshBasicMaterial({ color: 'blue' });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      group.add(mesh);
    }
  }

  private initializeGroup(scene: THREE.Scene) {
    const group = new THREE.Group();
    group.frustumCulled = false;
    group.applyMatrix4(this.cadFromCdfToThreeMatrix);
    scene.add(group);
    return group;
  }
}
