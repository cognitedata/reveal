/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { SectorScene, CadModelMetadata, SectorSceneFactory } from '@reveal/cad-parsers';

import { GpuOrderSectorsByVisibilityCoverage } from './OrderSectorsByVisibilityCoverage';
import { OccludingGeometryProvider } from './OccludingGeometryProvider';
import { createSectorMetadata, SectorTree, createGlContext } from '../../../../../test-utilities';

describe('OrderSectorsByVisibilityCoverage', () => {
  const glContext = createGlContext(64, 64);
  let renderer: THREE.WebGLRenderer;
  const identityMatrix = new THREE.Matrix4().identity();
  const singleSectorScene = createStubScene([
    0,
    [],
    new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1))
  ]);
  const cadModel = createStubModel('model', singleSectorScene, identityMatrix);
  const occludingGeometryProvider: OccludingGeometryProvider = {
    renderOccludingGeometry: jest.fn()
  };

  beforeEach(() => {
    renderer = new THREE.WebGLRenderer({ context: glContext });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('orderSectorsByVisibility() returns empty array when there are no models', () => {
    // Arrange
    const camera = new THREE.PerspectiveCamera();
    const coverageUtil = new GpuOrderSectorsByVisibilityCoverage({ renderer, occludingGeometryProvider });

    // Act
    glContext.clearColor(1, 1, 1, 1);
    jest
      .spyOn(renderer, 'readRenderTargetPixels')
      .mockImplementation((_target, _x, _y, _width, _height, buffer: Uint8Array) => {
        buffer.fill(255); // White - i.e. no sector
      });
    const arrays = coverageUtil.orderSectorsByVisibility(camera);

    // Assert
    expect(arrays).toBeEmpty();
  });

  test('rendered result has no sectors, returns empty array', () => {
    // Arrange
    const util = new GpuOrderSectorsByVisibilityCoverage({ renderer, occludingGeometryProvider });
    util.setModels([cadModel]);
    const camera = new THREE.PerspectiveCamera();

    // Act
    jest
      .spyOn(renderer, 'readRenderTargetPixels')
      .mockImplementation((_target, _x, _y, _width, _height, buffer: Uint8Array) => {
        buffer.fill(255); // White - i.e. no sector
      });
    const result = util.orderSectorsByVisibility(camera);

    // Assert
    expect(result).toBeEmpty();
  });

  test('rendered result has one sector, returns array with priority 1', () => {
    // Arrange
    const util = new GpuOrderSectorsByVisibilityCoverage({ renderer, occludingGeometryProvider });
    util.setModels([cadModel]);
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 20.0);
    camera.position.set(0, 0, -10);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    // Act
    jest
      .spyOn(renderer, 'readRenderTargetPixels')
      .mockImplementation((_target, _x, _y, _width, _height, buffer: Uint8Array) => {
        buffer.fill(255); // White - i.e. no sector
        buffer.set([0, 0, 0, 255], 0); // Sector ID 0 with 1.0 distance
      });
    const result = util.orderSectorsByVisibility(camera);

    // Assert
    expect(result.length).toBe(1);
    expect(result[0].sectorId).toBe(0);
    expect(result[0].priority).toBe(1.0);
    expect(result[0].model).toBe(cadModel);
  });

  test('two models, rendered result returns value at offset', () => {
    // Arrange
    const scene2 = createStubScene([1, [], new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1))]);
    const model1 = createStubModel('model1', singleSectorScene, identityMatrix);
    const model2 = createStubModel('model2', scene2, identityMatrix);
    const util = new GpuOrderSectorsByVisibilityCoverage({ renderer, occludingGeometryProvider });
    util.setModels([model1, model2]);
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 20.0);
    camera.position.set(0, 0, -10);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    // Act
    jest
      .spyOn(renderer, 'readRenderTargetPixels')
      .mockImplementation((_target, _x, _y, _width, _height, buffer: Uint8Array) => {
        buffer.fill(255); // White - i.e. no sector
        // One pixel for value 1 - i.e. sector 0 of model 2
        buffer.set([0, 0, 1, 255]);
      });

    glContext.clearColor(0, 0, 1.0 / 255, 1); // Store 1 in output
    const result = util.orderSectorsByVisibility(camera);

    // Assert - ensure output is first sector in second model
    expect(result.length).toBe(1);
    expect(result[0].sectorId).toBe(0);
    expect(result[0].priority).toBe(1.0);
    expect(result[0].model).toBe(model2);
  });
});

function createStubScene(tree: SectorTree): SectorScene {
  const root = createSectorMetadata(tree);
  const sceneFactory = new SectorSceneFactory();
  return sceneFactory.createSectorScene(8, 1, 'Meters', root);
}

function createStubModel(modelIdentifier: string, scene: SectorScene, modelMatrix: THREE.Matrix4) {
  const cadModel: CadModelMetadata = {
    modelIdentifier,
    modelBaseUrl: `https://localhost/${modelIdentifier}/`,
    modelMatrix,
    inverseModelMatrix: new THREE.Matrix4().copy(modelMatrix).invert(),
    scene,
    geometryClipBox: null
  };
  return cadModel;
}
