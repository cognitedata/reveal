/*!
 * Copyright 2020 Cognite AS
 */
import * as THREE from 'three';

import { DetermineSectorsInput, SectorCost } from '../../datamodels/cad/sector/culling/types';
import { MaterialManager } from '../../datamodels/cad/MaterialManager';
import { OrderSectorsByVisibilityCoverage } from '../../datamodels/cad/sector/culling/OrderSectorsByVisibilityCoverage';
import { ByVisibilityGpuSectorCuller, LevelOfDetail } from '../../internal';
import { SectorMetadata, CadNode, CadModelMetadata } from '../../experimental';

import { generateSectorTree } from '../testutils/createSectorMetadata';
import { createCadModelMetadata } from '../testutils/createCadModelMetadata';
import { CadModelSectorBudget } from '../../datamodels/cad/CadModelBudget';

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

describe('ByVisibilityGpuSectorCuller', () => {
  const materialManager = new MaterialManager();
  const setModelsMock: PropType<OrderSectorsByVisibilityCoverage, 'setModels'> = jest.fn();
  const setClippingMock: PropType<OrderSectorsByVisibilityCoverage, 'setClipping'> = jest.fn();
  const orderSectorsByVisibilityMock: PropType<
    OrderSectorsByVisibilityCoverage,
    'orderSectorsByVisibility'
  > = jest.fn();

  const coverageUtil: OrderSectorsByVisibilityCoverage = {
    setModels: setModelsMock,
    setClipping: setClippingMock,
    orderSectorsByVisibility: camera => {
      orderSectorsByVisibilityMock(camera);
      return [];
    },
    dispose: jest.fn()
  };
  const camera = new THREE.PerspectiveCamera();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('determineSectors sets models to coverage utility', () => {
    const culler = new ByVisibilityGpuSectorCuller({ coverageUtil });
    const model = createCadModelMetadata(generateSectorTree(1));
    const input = createDetermineSectorInput(camera, model);
    culler.determineSectors(input);
    expect(setModelsMock).toBeCalled();
  });

  test('determineSectors sets clip planes to coverage utility', () => {
    const clippingPlanes = [new THREE.Plane(), new THREE.Plane()];
    const culler = new ByVisibilityGpuSectorCuller({ coverageUtil });
    const model = createCadModelMetadata(generateSectorTree(1));
    const input = createDetermineSectorInput(camera, model);
    input.clippingPlanes = clippingPlanes;
    input.clipIntersection = true;
    culler.determineSectors(input);
    expect(setClippingMock).toBeCalledWith(clippingPlanes, true);
  });

  test('determineSectors returns sectors for all models', () => {
    // Arrange
    const culler = new ByVisibilityGpuSectorCuller({ coverageUtil });
    const model1 = createCadModelMetadata(generateSectorTree(1));
    const model2 = createCadModelMetadata(generateSectorTree(1));
    const input = createDetermineSectorInput(camera, [model1, model2]);

    // Act
    const sectors = culler.determineSectors(input);

    // Assert
    expect(orderSectorsByVisibilityMock).toBeCalledTimes(1); // Only render scene once
    const sectors1 = sectors.filter(x => x.blobUrl === model1.blobUrl);
    const sectors2 = sectors.filter(x => x.blobUrl === model2.blobUrl);
    expect(sectors1).not.toBeEmpty();
    expect(model1.scene.getAllSectors().map(x => x.id)).toContainAllValues(sectors1.map(x => x.metadata.id));
    expect(sectors2).not.toBeEmpty();
    expect(model2.scene.getAllSectors().map(x => x.id)).toContainAllValues(sectors2.map(x => x.metadata.id));
  });

  test('determineSectors returns sector from coverage utility by priority', () => {
    // Arrange
    const determineSectorCost = (sector: SectorMetadata, lod: LevelOfDetail): SectorCost => {
      switch (lod) {
        case LevelOfDetail.Detailed:
          return [
            { downloadSize: 10, drawCalls: 0 },
            { downloadSize: 10, drawCalls: 0 },
            { downloadSize: 100, drawCalls: 0 }
          ][sector.id];
        case LevelOfDetail.Simple:
          return { downloadSize: 1, drawCalls: 0 };
        default:
          return { downloadSize: 0, drawCalls: 0 };
      }
    };
    const culler = new ByVisibilityGpuSectorCuller({ coverageUtil, determineSectorCost });
    const model = createCadModelMetadata(generateSectorTree(2, 2));
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
    camera.position.set(1000, 1000, 1000);
    const input = createDetermineSectorInput(camera, model, {
      geometryDownloadSizeBytes: 20,
      maximumNumberOfDrawCalls: Infinity,
      highDetailProximityThreshold: 10
    });

    // Act
    const sectors = culler.determineSectors(input);

    // Assert
    expect(sectors.filter(x => x.levelOfDetail === LevelOfDetail.Detailed).map(x => x.metadata.id)).toEqual([0, 1]);
    expect(sectors.filter(x => x.levelOfDetail === LevelOfDetail.Simple).map(x => x.metadata.id)).toEqual([2]);
  });

  test('determineSectors limits sectors by draw calls', () => {
    // Arrange
    const determineSectorCost = (_sector: SectorMetadata, lod: LevelOfDetail): SectorCost => {
      switch (lod) {
        case LevelOfDetail.Detailed:
          return { downloadSize: 0, drawCalls: 5 };
        case LevelOfDetail.Simple:
          return { downloadSize: 0, drawCalls: 1 };
        default:
          return { downloadSize: 0, drawCalls: 0 };
      }
    };
    const culler = new ByVisibilityGpuSectorCuller({ coverageUtil, determineSectorCost });
    const model = createCadModelMetadata(generateSectorTree(2, 2));
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
    camera.position.set(1000, 1000, 1000);
    const input = createDetermineSectorInput(camera, model, {
      geometryDownloadSizeBytes: Infinity,
      maximumNumberOfDrawCalls: 10,
      highDetailProximityThreshold: -1
    });

    // Act
    const sectors = culler.determineSectors(input);

    // Assert
    expect(sectors.filter(x => x.levelOfDetail === LevelOfDetail.Detailed).map(x => x.metadata.id)).toEqual([0, 1]);
    expect(sectors.filter(x => x.levelOfDetail === LevelOfDetail.Simple).map(x => x.metadata.id)).toEqual([2]);
  });

  test('dispose() disposes coverge utility', () => {
    const culler = new ByVisibilityGpuSectorCuller({ coverageUtil });
    culler.dispose();
    expect(coverageUtil.dispose).toBeCalledTimes(1);
  });
});

function createDetermineSectorInput(
  camera: THREE.PerspectiveCamera,
  models: CadModelMetadata | CadModelMetadata[],
  budget?: CadModelSectorBudget
): DetermineSectorsInput {
  const determineSectorsInput: DetermineSectorsInput = {
    camera,
    clippingPlanes: [],
    clipIntersection: false,
    cadModelsMetadata: Array.isArray(models) ? models : [models],
    loadingHints: {},
    cameraInMotion: false,
    budget: budget || {
      geometryDownloadSizeBytes: 20,
      highDetailProximityThreshold: 10,
      maximumNumberOfDrawCalls: Infinity
    }
  };
  return determineSectorsInput;
}
