/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { mat4 } from 'gl-matrix';

import { SectorMetadata, SectorModelTransformation } from '@/dataModels/cad/internal/sector/types';
import { SectorScene, SectorSceneImpl } from '@/dataModels/cad/internal/sector/SectorScene';
import { GpuOrderSectorsByVisibilityCoverage } from '@/dataModels/cad/internal/sector/culling/OrderSectorsByVisibilityCoverage';
import { CadModelMetadata } from '@/dataModels/cad/internal';
import { traverseDepthFirst } from '@/utilities/traversal';
import { fromThreeMatrix } from '@/utilities';
import { Box3 } from '@/utilities/Box3';

import { createSectorMetadata, SectorTree } from '../../testUtils/createSectorMetadata';

describe('GpuOrderSectorsByVisibilityCoverage', () => {
  const glContext: WebGLRenderingContext = require('gl')(64, 64);
  const renderSize = new THREE.Vector2(64, 64);
  const identityTransform = createModelTransformation(new THREE.Matrix4().identity());
  const singleSectorScene = createStubScene([0, [], Box3.fromBounds(-1, -1, -1, 1, 1, 1)]);
  const cadModel = createStubModel('model', singleSectorScene, identityTransform);

  test('orderSectorsByVisibility() returns empty array when there are no models', () => {
    // Arrange
    const camera = new THREE.PerspectiveCamera();
    const coverageUtil = new GpuOrderSectorsByVisibilityCoverage({ glContext, renderSize });

    // Act
    const arrays = coverageUtil.orderSectorsByVisibility(camera);

    // Assert
    expect(arrays).toBeEmpty();
  });

  test('rendered result has no sectors, returns empty array', () => {
    // Arrange
    const util = new GpuOrderSectorsByVisibilityCoverage({ glContext, renderSize });
    util.setModels([cadModel]);
    const camera = new THREE.PerspectiveCamera();

    // Act
    glContext.clearColor(1, 1, 1, 1);
    const result = util.orderSectorsByVisibility(camera);

    // Assert
    expect(result).toBeEmpty();
  });

  test('rendered result has one sector, returns array with priority 1', () => {
    // Arrange
    const util = new GpuOrderSectorsByVisibilityCoverage({ glContext, renderSize });
    util.setModels([cadModel]);
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 20.0);
    camera.position.set(0, 0, -10);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    // Act
    glContext.clearColor(0, 0, 0, 1); // Store 0 in output
    const result = util.orderSectorsByVisibility(camera);

    // Assert
    expect(result.length).toBe(1);
    expect(result[0].sectorId).toBe(0);
    expect(result[0].priority).toBe(1.0);
    expect(result[0].model).toBe(cadModel);
  });

  test('two models, rendered result returns value at offset', () => {
    // Arrange
    const scene2 = createStubScene([0, [], Box3.fromBounds(-1, -1, -1, 1, 1, 1)]);
    const model1 = createStubModel('model1', singleSectorScene, identityTransform);
    const model2 = createStubModel('model2', scene2, identityTransform);
    const util = new GpuOrderSectorsByVisibilityCoverage({ glContext, renderSize });
    util.setModels([model1, model2]);
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 20.0);
    camera.position.set(0, 0, -10);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    // Act
    glContext.clearColor(0, 0, 1.0 / 255, 1); // Store 1 in output
    const result = util.orderSectorsByVisibility(camera);

    // Assert - ensure output is first sector in second model
    expect(result.length).toBe(1);
    expect(result[0].sectorId).toBe(0);
    expect(result[0].priority).toBe(1.0);
    expect(result[0].model).toBe(model2);
  });

  test('with clipping plane, removes clipped sectors', () => {
    // Arrange
    // Scene has one root with two children
    const scene = createStubScene([
      0,
      [
        // Split space in two along X axis
        [1, [], Box3.fromBounds(-1, -1, -1, -0.1, 1, 1)],
        [2, [], Box3.fromBounds(0.1, -1, -1, 1, 1, 1)]
      ],
      Box3.fromBounds(-1, -1, -1, 1, 1, 1)
    ]);
  });
});

function createStubScene(tree: SectorTree): SectorScene {
  const sectorsMap = new Map<number, SectorMetadata>();
  const root = createSectorMetadata(tree);
  traverseDepthFirst(root, x => {
    sectorsMap.set(x.id, x);
    return true;
  });
  return new SectorSceneImpl(8, 1, root, sectorsMap);
}

function createModelTransformation(modelTransform?: THREE.Matrix4): SectorModelTransformation {
  modelTransform = modelTransform || new THREE.Matrix4().identity();
  return {
    modelMatrix: fromThreeMatrix(mat4.create(), modelTransform),
    inverseModelMatrix: fromThreeMatrix(mat4.create(), new THREE.Matrix4().getInverse(modelTransform))
  };
}

function createStubModel(blobUrl: string, scene: SectorScene, modelTransformation: SectorModelTransformation) {
  const cadModel: CadModelMetadata = {
    blobUrl,
    modelTransformation,
    scene
  };
  return cadModel;
}
