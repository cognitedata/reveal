/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { GpuOrderSectorsByVisibleCoverage as GpuOrderSectorsByVisibilityCoverage } from '../../../threejs';
import { SectorMetadata, SectorModelTransformation } from '../../../models/cad/types';
import { SectorScene, SectorSceneImpl } from '../../../models/cad/SectorScene';
import { createSectorMetadata, SectorTree } from '../../testUtils/createSectorMetadata';
import { traverseDepthFirst } from '../../../utils/traversal';
import { fromThreeMatrix } from '../../../views/threejs/utilities';
import { mat4 } from 'gl-matrix';
import { Box3 } from '../../../utils/Box3';

describe('GpuOrderSectorsByVisibilityCoverage', () => {
  const glContext: WebGLRenderingContext = require('gl')(64, 64);
  const renderSize = new THREE.Vector2(64, 64);
  const identityTransform = createModelTransformation(new THREE.Matrix4().identity());
  const singleSectorScene = createStubScene([0, [], Box3.fromBounds(-1, -1, -1, 1, 1, 1)]);

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
    util.addModel(singleSectorScene, identityTransform);
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
    util.addModel(singleSectorScene, identityTransform);
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
    expect(result[0].scene).toBe(singleSectorScene);
  });

  test('two models, rendered result returns value at offset', () => {
    // Arrange
    const model1 = singleSectorScene;
    const model2 = createStubScene([0, [], Box3.fromBounds(-1, -1, -1, 1, 1, 1)]);
    const util = new GpuOrderSectorsByVisibilityCoverage({ glContext, renderSize });
    util.addModel(model1, identityTransform);
    util.addModel(model2, identityTransform);
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
    expect(result[0].scene).toBe(model2);
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
