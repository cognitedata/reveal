/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { ModelIdentifier } from '@reveal/modeldata-api';
import { CadMaterialManager, Materials } from '@reveal/rendering';
import { GltfSectorRepository, SectorRepository } from '..';
import { assertNever } from '../../utilities';
import { ConsumedSector } from '@reveal/cad-parsers';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import { CadSceneRootMetadata, BoundingBox } from '@reveal/cad-parsers/src/metadata/parsers/types';
import { SimpleTestFixtureComponents, SimpleVisualTestFixture } from '../../../visual-tests';

export class SectorLoaderVisualTestFixture extends SimpleVisualTestFixture {
  async setup(simpleTestFixtureComponents: SimpleTestFixtureComponents): Promise<void> {
    const { scene, cameraControls, dataProviders } = simpleTestFixtureComponents;
    const { modelDataProvider, modelIdentifier, modelMetadataProvider } = dataProviders;

    const group = this.initializeGroup(scene);

    const cadMaterialManager = new CadMaterialManager();
    const sectorRepository = new GltfSectorRepository(modelDataProvider, cadMaterialManager);

    const gltfOutput = (await modelMetadataProvider.getModelOutputs(modelIdentifier)).find(
      output => output.format === 'gltf-directory'
    )!;
    const modelUri = await modelMetadataProvider.getModelUri(modelIdentifier, gltfOutput);
    const sceneJson = (await modelDataProvider.getJsonFile(modelUri, 'scene.json')) as CadSceneRootMetadata;

    const box = sceneJson.sectors[0].boundingBox;
    const rootBoundingBox = new THREE.Box3(
      new THREE.Vector3(box.min.x, box.min.y, box.min.z),
      new THREE.Vector3(box.max.x, box.max.y, box.max.z)
    );

    this.fitCameraToBoundingBox(rootBoundingBox, 1.3);

    cameraControls.target.copy(rootBoundingBox.getCenter(new THREE.Vector3()));

    const consumedSectorsGroup = await this.loadSectors(
      sceneJson,
      modelIdentifier,
      sectorRepository,
      cadMaterialManager,
      modelUri
    );

    group.add(consumedSectorsGroup);
  }

  private async loadSectors(
    sceneJson: CadSceneRootMetadata,
    modelIdentifier: ModelIdentifier,
    sectorRepository: SectorRepository,
    cadMaterialManager: CadMaterialManager,
    modelUri: string
  ): Promise<THREE.Group> {
    const internalId = modelIdentifier.revealInternalId.toString();

    cadMaterialManager.addModelMaterials(internalId, sceneJson.maxTreeIndex);

    const model = new THREE.Group();

    function toThreeBox(box: BoundingBox) {
      return new THREE.Box3(
        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
        new THREE.Vector3(box.max.x, box.max.y, box.max.z)
      );
    }

    await Promise.all(
      sceneJson.sectors.map(async sector => {
        const threeBoundingBox = toThreeBox(sector.boundingBox);
        const consumedSector = await sectorRepository.loadSector({
          modelBaseUrl: modelUri,
          modelIdentifier: internalId,
          metadata: {
            ...sector,
            subtreeBoundingBox: threeBoundingBox,
            geometryBoundingBox: undefined,
            children: [],
            estimatedRenderCost: 0
          } as any,
          levelOfDetail: 2,
          geometryClipBox: null
        });

        if (consumedSector.group) {
          model.add(consumedSector.group);
        }

        const group = this.createGltfSectorGroup(consumedSector, cadMaterialManager.getModelMaterials(internalId));
        model.add(group);
      })
    );

    return model;
  }

  private initializeGroup(scene: THREE.Scene) {
    const group = new THREE.Group();
    group.frustumCulled = false;
    group.applyMatrix4(this.cadFromCdfToThreeMatrix);
    scene.add(group);
    return group;
  }

  private createGltfSectorGroup(consumedSector: ConsumedSector, materials: Materials) {
    const geometryGroup = new THREE.Group();

    for (const parsedGeometry of consumedSector.geometryBatchingQueue!) {
      const material = this.getShaderMaterial(parsedGeometry.type, materials);

      const count = parsedGeometry.geometryBuffer.getAttribute('a_treeIndex').count;

      const mesh = new THREE.InstancedMesh(parsedGeometry.geometryBuffer, material, count);

      mesh.onBeforeRender = (_0, _1, camera: THREE.Camera) => {
        if (material.uniforms.renderMode) {
          material.uniforms.renderMode.value = 1;
        }
        (material.uniforms.inverseModelMatrix?.value as THREE.Matrix4)?.copy(mesh.matrixWorld).invert();
        (material.uniforms.cameraPosition?.value as THREE.Vector3)?.copy(camera.position);
        material.needsUpdate = true;
      };

      mesh.updateMatrixWorld(true);

      geometryGroup.add(mesh);
    }

    return geometryGroup;
  }

  private getShaderMaterial(type: RevealGeometryCollectionType, materials: Materials): THREE.RawShaderMaterial {
    switch (type) {
      case RevealGeometryCollectionType.BoxCollection:
        return materials.box;
      case RevealGeometryCollectionType.CircleCollection:
        return materials.circle;
      case RevealGeometryCollectionType.ConeCollection:
        return materials.cone;
      case RevealGeometryCollectionType.EccentricConeCollection:
        return materials.eccentricCone;
      case RevealGeometryCollectionType.EllipsoidSegmentCollection:
        return materials.ellipsoidSegment;
      case RevealGeometryCollectionType.GeneralCylinderCollection:
        return materials.generalCylinder;
      case RevealGeometryCollectionType.GeneralRingCollection:
        return materials.generalRing;
      case RevealGeometryCollectionType.QuadCollection:
        return materials.quad;
      case RevealGeometryCollectionType.TorusSegmentCollection:
        return materials.torusSegment;
      case RevealGeometryCollectionType.TrapeziumCollection:
        return materials.trapezium;
      case RevealGeometryCollectionType.NutCollection:
        return materials.nut;
      case RevealGeometryCollectionType.TriangleMesh:
        return materials.triangleMesh;
      case RevealGeometryCollectionType.InstanceMesh:
        return materials.instancedMesh;
      default:
        assertNever(type);
    }
  }
}
