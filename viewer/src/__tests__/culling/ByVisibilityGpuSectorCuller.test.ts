/*!
 * Copyright 2020 Cognite AS
 */
import * as THREE from 'three';
import { OrderSectorsByVisibilityCoverage } from '../../views/threejs/OrderSectorsByVisibilityCoverage';
import { ByVisibilityGpuSectorCuller } from '../../culling/ByVisibilityGpuSectorCuller';
import { CadModel } from '../../models/cad/CadModel';
import { SectorMetadata } from '../../models/cad/types';
import { ModelDataRetriever } from '../../datasources/ModelDataRetriever';
import { SectorSceneImpl, SectorScene } from '../../models/cad/SectorScene';
import { mat4, vec3 } from 'gl-matrix';
import { generateSectorTree } from '../testUtils/createSectorMetadata';
import { DetermineSectorsByProximityInput } from '../../models/cad/determineSectors';
import { LevelOfDetail } from '../../data/model/LevelOfDetail';

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

describe('ByVisibilityGpuSectorCuller', () => {
  const addModelMock: PropType<OrderSectorsByVisibilityCoverage, 'addModel'> = jest.fn();
  const orderSectorsByVisibilityMock: PropType<
    OrderSectorsByVisibilityCoverage,
    'orderSectorsByVisibility'
  > = jest.fn();

  const coverageUtil: OrderSectorsByVisibilityCoverage = {
    addModel: addModelMock,
    orderSectorsByVisibility: c => {
      orderSectorsByVisibilityMock(c);
      return [];
    }
  };
  const camera = new THREE.PerspectiveCamera();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('addModel adds model to coverage utility', () => {
    const culler = new ByVisibilityGpuSectorCuller(camera, { coverageUtil });
    const model = createModel(generateSectorTree(1));
    culler.addModel(model);
    expect(addModelMock).toBeCalledWith(model.scene, model.modelTransformation);
  });

  test('determineSectors returns sectors for correct scene', () => {
    // Arrange
    const culler = new ByVisibilityGpuSectorCuller(camera, { coverageUtil });
    const model1 = createModel(generateSectorTree(1));
    const model2 = createModel(generateSectorTree(1));
    culler.addModel(model1);
    culler.addModel(model2);
    const input1 = createDetermineSectorInput(model1.scene);
    const input2 = createDetermineSectorInput(model2.scene);

    // Act
    const sectors1 = culler.determineSectors(input1);
    const sectors2 = culler.determineSectors(input2);

    // Assert
    expect(orderSectorsByVisibilityMock).toBeCalledTimes(1); // Only render scene once
    expect(sectors1).not.toBeEmpty();
    expect(model1.scene.getAllSectors()).toContainAllValues(sectors1.map(x => x.metadata));
    expect(sectors2).not.toBeEmpty();
    expect(model2.scene.getAllSectors()).toContainAllValues(sectors2.map(x => x.metadata));
  });

  test('determineSectors returns sector from coverate utility by priority', () => {
    // Arrange
    const determineSectorCost = (sector: SectorMetadata, lod: LevelOfDetail) => {
      switch (lod) {
        case LevelOfDetail.Detailed:
          return [10, 10, 100][sector.id];
        case LevelOfDetail.Simple:
          return 1;
        default:
          return 0;
      }
    };
    const culler = new ByVisibilityGpuSectorCuller(camera, { coverageUtil, determineSectorCost, costLimit: 20 });
    const model = createModel(generateSectorTree(2, 2));
    culler.addModel(model);
    coverageUtil.orderSectorsByVisibility = () => {
      return [
        { scene: model.scene, sectorId: 0, priority: 1000.0 },
        { scene: model.scene, sectorId: 1, priority: 100.0 },
        { scene: model.scene, sectorId: 2, priority: 10.0 }
      ];
    };
    // Place camera far away to avoid sectors being loaded because camera is near them
    const cameraPosition = vec3.fromValues(1000, 1000, 1000);
    const input = createDetermineSectorInput(model.scene, cameraPosition);

    // Act
    const sectors = culler.determineSectors(input);

    // Assert
    expect(sectors.filter(x => x.levelOfDetail === LevelOfDetail.Detailed).map(x => x.sectorId)).toEqual([0, 1]);
    expect(sectors.filter(x => x.levelOfDetail === LevelOfDetail.Simple).map(x => x.sectorId)).toEqual([2]);
  });
});

function createModel(root: SectorMetadata): CadModel {
  const dataRetriever: ModelDataRetriever = jest.fn() as any;
  const scene = SectorSceneImpl.createFromRootSector(8, 1, root);

  const model: CadModel = {
    dataRetriever,
    modelTransformation: {
      inverseModelMatrix: mat4.identity(mat4.create()),
      modelMatrix: mat4.identity(mat4.create())
    },
    scene
  };
  return model;
}

function createDetermineSectorInput(scene: SectorScene, cameraPosition?: vec3): DetermineSectorsByProximityInput {
  const determineSectorsInput: DetermineSectorsByProximityInput = {
    sectorScene: scene,
    cameraFov: 60.0,
    cameraPosition: cameraPosition || vec3.fromValues(0, 0, 0),
    cameraModelMatrix: mat4.identity(mat4.create()),
    projectionMatrix: mat4.identity(mat4.create())
  };
  return determineSectorsInput;
}
