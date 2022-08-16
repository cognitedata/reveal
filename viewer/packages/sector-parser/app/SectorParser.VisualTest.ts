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

    const materialMap = this.setMaterialMap();

    const loader = new GltfSectorParser();

    const gltfOutput = (await modelMetadataProvider.getModelOutputs(modelIdentifier)).find(
      output => output.format === 'gltf-directory'
    )!;
    const modelUri = await modelMetadataProvider.getModelUri(modelIdentifier, gltfOutput);
    const sceneJson = await modelDataProvider.getJsonFile(modelUri, 'scene.json');

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

    this.fitCameraToBoundingBox(boundingBox, 2);

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
  }

  private setMaterialMap(): Map<RevealGeometryCollectionType, THREE.RawShaderMaterial> {
    return new Map([
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
  }

  private initializeGroup(scene: THREE.Scene) {
    const group = new THREE.Group();
    group.frustumCulled = false;
    group.applyMatrix4(this.cadFromCdfToThreeMatrix);
    scene.add(group);
    return group;
  }
}
