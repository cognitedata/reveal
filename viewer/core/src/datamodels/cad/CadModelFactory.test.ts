/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { Mutable } from '../../utilities/reflection';
import { createCadModelMetadata } from '../../__testutilities__/createCadModelMetadata';
import { generateSectorTree } from '../../__testutilities__/createSectorMetadata';
import { CadMaterialManager } from './CadMaterialManager';
import { CadModelFactory } from './CadModelFactory';
import { CadModelMetadata } from './CadModelMetadata';

describe('CadModelFactory', () => {
  let materialManager: CadMaterialManager;
  let modelMetadata: CadModelMetadata;
  let factory: CadModelFactory;

  beforeEach(() => {
    materialManager = new CadMaterialManager();
    const rootSector = generateSectorTree(2);
    modelMetadata = createCadModelMetadata(rootSector);

    factory = new CadModelFactory(materialManager);
  });

  test('createModel() initializes model materials', () => {
    const addModelMaterialsSpy = jest.spyOn(materialManager, 'addModelMaterials');
    const node = factory.createModel(modelMetadata);

    expect(node).toBeTruthy();
    expect(addModelMaterialsSpy).toBeCalledTimes(1);
  });

  test('createModel() sets model clipping planes when a clip box is set', () => {
    const setModelClippingPlanesSpy = jest.spyOn(materialManager, 'setModelClippingPlanes');
    (modelMetadata as Mutable<CadModelMetadata>).geometryClipBox = new THREE.Box3(
      new THREE.Vector3(-1, -2, -3),
      new THREE.Vector3(4, 5, 6)
    );

    factory.createModel(modelMetadata);

    expect(setModelClippingPlanesSpy).toBeCalledTimes(1);
    expect(setModelClippingPlanesSpy).toBeCalledWith(expect.toBeString(), expect.toBeArrayOfSize(6));
  });
});
