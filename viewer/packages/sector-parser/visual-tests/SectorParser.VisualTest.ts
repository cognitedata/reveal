/*!
 * Copyright 2022 Cognite AS
 */

import type { Matrix4, PerspectiveCamera, RawShaderMaterial, Scene } from 'three';
import { Box3, Group, Mesh, Vector3 } from 'three';

import type { SimpleTestFixtureComponents } from '../../../visual-tests';
import { SimpleVisualTestFixture } from '../../../visual-tests';
import { GltfSectorParser } from '../src/GltfSectorParser';
import type { RevealGeometryCollectionType } from '../src/types';
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

    const boundingBox = new Box3(new Vector3(min.x, min.y, min.z), new Vector3(max.x, max.y, max.z));
    boundingBox.applyMatrix4(this.cadFromCdfToThreeMatrix);

    const fileNames = sectors.map((sector: SceneJson['sectors'][number]) => sector.sectorFileName);

    const blobs = await Promise.all(
      fileNames.map((fileName: string) => modelDataProvider.getBinaryFile(modelUri, fileName))
    );

    await this.loadSectors(blobs, loader, materialMap, camera, group);

    this.fitCameraToBoundingBox(boundingBox, 1.3);

    return Promise.resolve();
  }

  private async loadSectors(
    blobs: ArrayBuffer[],
    loader: GltfSectorParser,
    materialMap: Map<RevealGeometryCollectionType, RawShaderMaterial>,
    camera: PerspectiveCamera,
    group: Group
  ) {
    return Promise.all(
      blobs.map(async element => {
        const geometries = await loader.parseSector(element);
        geometries.forEach(result => {
          const material = materialMap.get(result.type)!;
          const mesh = new Mesh(result.geometryBuffer, material);
          mesh.frustumCulled = false;
          mesh.onBeforeRender = () => {
            (material.uniforms.inverseModelMatrix?.value as Matrix4)?.copy(mesh.matrixWorld).invert();
            (material.uniforms.cameraPosition?.value as Vector3)?.copy(camera.position);
          };
          group.add(mesh);
        });
      })
    );
  }

  private initializeGroup(scene: Scene) {
    const group = new Group();
    group.frustumCulled = false;
    group.applyMatrix4(this.cadFromCdfToThreeMatrix);
    scene.add(group);
    return group;
  }
}
