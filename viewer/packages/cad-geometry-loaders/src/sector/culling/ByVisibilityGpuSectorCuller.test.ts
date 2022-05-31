/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { DetermineSectorsInput, SectorCost } from './types';
import { OrderSectorsByVisibilityCoverage } from './OrderSectorsByVisibilityCoverage';
import { ByVisibilityGpuSectorCuller } from './ByVisibilityGpuSectorCuller';
import { CadModelBudget } from '../../CadModelBudget';
import { PropType } from '../../utilities/reflection';

import { CadMaterialManager } from '@reveal/rendering';
import { SectorMetadata, CadModelMetadata, LevelOfDetail } from '@reveal/cad-parsers';

import { SectorRepository } from '@reveal/sector-loader';

import {
  createGlContext,
  createCadModelMetadata,
  generateV8SectorTree,
  createV9SectorMetadata
} from '../../../../../test-utilities';
import { Mock } from 'moq.ts';
import { CadNode } from '@reveal/cad-model';

describe('ByVisibilityGpuSectorCuller', () => {
  const materialManager = new CadMaterialManager();
  const setModelsMock: PropType<OrderSectorsByVisibilityCoverage, 'setModels'> = jest.fn();
  const setClippingMock: PropType<OrderSectorsByVisibilityCoverage, 'setClipping'> = jest.fn();
  const orderSectorsByVisibilityMock: PropType<OrderSectorsByVisibilityCoverage, 'orderSectorsByVisibility'> =
    jest.fn();
  const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
  const renderer = new THREE.WebGLRenderer({ context });

  const coverageUtil: OrderSectorsByVisibilityCoverage = {
    setModels: setModelsMock,
    setClipping: setClippingMock,
    orderSectorsByVisibility: camera => {
      orderSectorsByVisibilityMock(camera);
      return [];
    },
    cullOccludedSectors: (_camera, sectors) => {
      return sectors;
    },
    dispose: jest.fn()
  };
  const camera = new THREE.PerspectiveCamera();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('determineSectors throws if model is not v9', () => {
    const v8input = createDetermineSectorInput(camera, createCadModelMetadata(8, createV9SectorMetadata([0, []])));
    const culler = new ByVisibilityGpuSectorCuller({ renderer, coverageUtil });

    expect(() => culler.determineSectors(v8input)).toThrowError();
  });

  test('determineSectors sets models to coverage utility', () => {
    const culler = new ByVisibilityGpuSectorCuller({ renderer, coverageUtil });
    const model = createCadModelMetadata(8, generateV8SectorTree(1));
    const input = createDetermineSectorInput(camera, model);
    culler.determineSectors(input);
    expect(setModelsMock).toBeCalled();
  });

  test('determineSectors sets clip planes to coverage utility', () => {
    const clippingPlanes = [new THREE.Plane(), new THREE.Plane()];
    const culler = new ByVisibilityGpuSectorCuller({ renderer, coverageUtil });
    const model = createCadModelMetadata(8, generateV8SectorTree(1));
    const input = createDetermineSectorInput(camera, model);
    input.clippingPlanes = clippingPlanes;
    culler.determineSectors(input);
    expect(setClippingMock).toBeCalledWith(clippingPlanes);
  });

  test('determineSectors returns sectors for all models', () => {
    // Arrange
    const culler = new ByVisibilityGpuSectorCuller({ renderer, coverageUtil });
    const model1 = createCadModelMetadata(8, generateV8SectorTree(1));
    const model2 = createCadModelMetadata(8, generateV8SectorTree(1));
    const input = createDetermineSectorInput(camera, [model1, model2]);

    // Act
    const result = culler.determineSectors(input);
    const sectors = result.wantedSectors;

    // Assert
    expect(orderSectorsByVisibilityMock).toBeCalledTimes(1); // Only render scene once
    const sectors1 = sectors.filter(x => x.modelIdentifier === model1.modelIdentifier);
    const sectors2 = sectors.filter(x => x.modelIdentifier === model2.modelIdentifier);
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
            { downloadSize: 10, drawCalls: 0, renderCost: 5 },
            { downloadSize: 10, drawCalls: 0, renderCost: 5 },
            { downloadSize: 100, drawCalls: 0, renderCost: 5 }
          ][sector.id];
        case LevelOfDetail.Simple:
          return { downloadSize: 1, drawCalls: 0, renderCost: 0 };
        default:
          return { downloadSize: 0, drawCalls: 0, renderCost: 0 };
      }
    };
    const culler = new ByVisibilityGpuSectorCuller({ renderer, coverageUtil, determineSectorCost });
    const model = createCadModelMetadata(8, generateV8SectorTree(2, 2));
    materialManager.addModelMaterials(model.modelIdentifier, 0);
    const mockV8SectorRepository = new Mock<SectorRepository>();
    const cadNode = new CadNode(model, materialManager, mockV8SectorRepository.object());
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
      highDetailProximityThreshold: 10,
      maximumRenderCost: 8
    });

    // Act
    const result = culler.determineSectors(input);
    const sectors = result.wantedSectors;

    // Assert
    expect(sectors.filter(x => x.levelOfDetail === LevelOfDetail.Detailed).map(x => x.metadata.id)).toEqual([0, 1]);
    expect(sectors.filter(x => x.levelOfDetail === LevelOfDetail.Simple).map(x => x.metadata.id)).toEqual([2]);
  });

  test('determineSectors limits sectors by render cost', () => {
    // Arrange
    const determineSectorCost = (_sector: SectorMetadata, lod: LevelOfDetail): SectorCost => {
      switch (lod) {
        case LevelOfDetail.Detailed:
          return { downloadSize: 0, drawCalls: 0, renderCost: 5 };
        case LevelOfDetail.Simple:
          return { downloadSize: 0, drawCalls: 0, renderCost: 1 };
        default:
          return { downloadSize: 0, drawCalls: 0, renderCost: 0 };
      }
    };
    const culler = new ByVisibilityGpuSectorCuller({ renderer, coverageUtil, determineSectorCost });
    const model = createCadModelMetadata(8, generateV8SectorTree(2, 2));
    const mockV8SectorRepository = new Mock<SectorRepository>();
    materialManager.addModelMaterials(model.modelIdentifier, 0);
    const cadNode = new CadNode(model, materialManager, mockV8SectorRepository.object());
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
      highDetailProximityThreshold: -1,
      maximumRenderCost: 10
    });

    // Act
    const result = culler.determineSectors(input);
    const sectors = result.wantedSectors;

    // Assert
    expect(sectors.filter(x => x.levelOfDetail === LevelOfDetail.Detailed).map(x => x.metadata.id)).toEqual([0, 1]);
    expect(sectors.filter(x => x.levelOfDetail === LevelOfDetail.Simple).map(x => x.metadata.id)).toEqual([2]);
  });

  test('dispose() disposes coverage utility', () => {
    const culler = new ByVisibilityGpuSectorCuller({ renderer, coverageUtil });
    culler.dispose();
    expect(coverageUtil.dispose).toBeCalledTimes(1);
  });
});

function createDetermineSectorInput(
  camera: THREE.PerspectiveCamera,
  models: CadModelMetadata | CadModelMetadata[],
  budget?: CadModelBudget
): DetermineSectorsInput {
  const determineSectorsInput: DetermineSectorsInput = {
    camera,
    clippingPlanes: [],
    cadModelsMetadata: Array.isArray(models) ? models : [models],
    loadingHints: {},
    cameraInMotion: false,
    budget: budget || {
      highDetailProximityThreshold: 10,
      maximumRenderCost: Infinity
    },
    prioritizedAreas: []
  };
  return determineSectorsInput;
}
