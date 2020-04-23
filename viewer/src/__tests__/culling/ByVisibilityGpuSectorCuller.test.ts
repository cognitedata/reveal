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

function createDetermineSectorInput(scene: SectorScene): DetermineSectorsByProximityInput {
  const determineSectorsInput: DetermineSectorsByProximityInput = {
    sectorScene: scene,
    cameraFov: 60.0,
    cameraPosition: vec3.fromValues(0, 0, 0),
    cameraModelMatrix: mat4.identity(mat4.create()),
    projectionMatrix: mat4.identity(mat4.create())
  };
  return determineSectorsInput;
}
