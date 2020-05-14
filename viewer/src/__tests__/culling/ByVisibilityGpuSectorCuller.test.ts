/*!
 * Copyright 2020 Cognite AS
 */
import * as THREE from 'three';
import { OrderSectorsByVisibilityCoverage } from '../../views/threejs/OrderSectorsByVisibilityCoverage';
import { ByVisibilityGpuSectorCuller } from '../../culling/ByVisibilityGpuSectorCuller';
import { CadModel } from '../../dataModels/cad/';
import { SectorMetadata } from '../../models/cad/types';
import { ModelDataRetriever } from '../../datasources/ModelDataRetriever';
import { SectorSceneImpl } from '../../models/cad/SectorScene';
import { mat4, vec3 } from 'gl-matrix';
import { generateSectorTree } from '../testUtils/createSectorMetadata';
import { DetermineSectorsByProximityInput } from '../../models/cad/determineSectors';
import { LevelOfDetail } from '../../data/model/LevelOfDetail';
import { MaterialManager } from '../../views/threejs/cad/MaterialManager';
import { CadNode } from '../../views/threejs';

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

describe('ByVisibilityGpuSectorCuller', () => {
  const materialManager = new MaterialManager();
  const setModelsMock: PropType<OrderSectorsByVisibilityCoverage, 'setModels'> = jest.fn();
  const orderSectorsByVisibilityMock: PropType<
    OrderSectorsByVisibilityCoverage,
    'orderSectorsByVisibility'
  > = jest.fn();

  const coverageUtil: OrderSectorsByVisibilityCoverage = {
    setModels: setModelsMock,
    orderSectorsByVisibility: c => {
      orderSectorsByVisibilityMock(c);
      return [];
    }
  };
  const camera = new THREE.PerspectiveCamera();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('determineSectors sets models to coverage utility', () => {
    const culler = new ByVisibilityGpuSectorCuller(camera, { coverageUtil });
    const model = createModel(generateSectorTree(1));
    const input = createDetermineSectorInput(model);
    culler.determineSectors(input);
    expect(setModelsMock).toBeCalled();
  });

  test('determineSectors returns sectors for all models', () => {
    // Arrange
    const culler = new ByVisibilityGpuSectorCuller(camera, { coverageUtil });
    const model1 = createModel(generateSectorTree(1));
    const model2 = createModel(generateSectorTree(1));
    const input = createDetermineSectorInput([model1, model2]);

    // Act
    const sectors = culler.determineSectors(input);

    // Assert
    expect(orderSectorsByVisibilityMock).toBeCalledTimes(1); // Only render scene once
    const sectors1 = sectors.filter(x => x.scene === model1.scene);
    const sectors2 = sectors.filter(x => x.scene === model2.scene);
    expect(sectors1).not.toBeEmpty();
    expect(model1.scene.getAllSectors()).toContainAllValues(sectors1.map(x => x.metadata));
    expect(sectors2).not.toBeEmpty();
    expect(model2.scene.getAllSectors()).toContainAllValues(sectors2.map(x => x.metadata));
  });

  test('determineSectors returns sector from coverage utility by priority', () => {
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
    const cadNode = new CadNode(model, materialManager);
    Object.defineProperty(cadNode, 'cadModel', { get: jest.fn().mockReturnValue(model) });
    // culler.(model);
    coverageUtil.orderSectorsByVisibility = () => {
      return [
        { model, sectorId: 0, priority: 1000.0 },
        { model, sectorId: 1, priority: 100.0 },
        { model, sectorId: 2, priority: 10.0 }
      ];
    };
    // Place camera far away to avoid sectors being loaded because camera is near them
    const cameraPosition = vec3.fromValues(1000, 1000, 1000);
    const input = createDetermineSectorInput(model, cameraPosition);

    // Act
    const sectors = culler.determineSectors(input);

    // Assert
    expect(sectors.filter(x => x.levelOfDetail === LevelOfDetail.Detailed).map(x => x.metadata.id)).toEqual([0, 1]);
    expect(sectors.filter(x => x.levelOfDetail === LevelOfDetail.Simple).map(x => x.metadata.id)).toEqual([2]);
  });
});

function createModel(root: SectorMetadata): CadModel {
  const dataRetriever: ModelDataRetriever = jest.fn() as any;
  const scene = SectorSceneImpl.createFromRootSector(8, 1, root);

  const model: CadModel = {
    identifier: 'test',
    dataRetriever,
    modelTransformation: {
      inverseModelMatrix: mat4.identity(mat4.create()),
      modelMatrix: mat4.identity(mat4.create())
    },
    scene
  };
  return model;
}

function createDetermineSectorInput(
  models: CadModel | CadModel[],
  cameraPosition?: vec3
): DetermineSectorsByProximityInput {
  const determineSectorsInput: DetermineSectorsByProximityInput = {
    cadModels: Array.isArray(models) ? models : [models],
    cameraConfig: {
      cameraFov: 60.0,
      cameraPosition: cameraPosition || vec3.fromValues(0, 0, 0),
      cameraModelMatrix: mat4.identity(mat4.create()),
      projectionMatrix: mat4.identity(mat4.create())
    },
    loadingHints: {}
  };
  return determineSectorsInput;
}
