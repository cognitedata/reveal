/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { CadModelMetadata } from '@reveal/cad-parsers';
import { CadMaterialManager } from '@reveal/rendering';

import { Mutable } from '../../../../test-utilities/src/reflection';
import { generateSectorTree, createCadModelMetadata } from '../../../../test-utilities';
import { CadModelFactory } from './CadModelFactory';
import { ModelDataProvider, ModelMetadataProvider, ModelIdentifier, BlobOutputMetadata } from '@reveal/modeldata-api';
import { Mock } from 'moq.ts';

describe('CadModelFactory', () => {
  let materialManager: CadMaterialManager;
  let modelMetadata: CadModelMetadata;
  let factory: CadModelFactory;
  let mockIdentifierObject: ModelIdentifier;

  beforeEach(() => {
    materialManager = new CadMaterialManager();
    const rootSector = generateSectorTree(2);
    modelMetadata = createCadModelMetadata(rootSector);

    const mockIdentifier = new Mock<ModelIdentifier>().setup(p => p.revealInternalId).returns(Symbol('test'));
    mockIdentifierObject = mockIdentifier.object();

    const modelMetadataProviderMock = new Mock<ModelMetadataProvider>()
      .setup(instance => instance.getModelOutputs(mockIdentifierObject))
      .returns(Promise.resolve([{ blobId: 1, format: 'reveal-directory', version: 8 } as BlobOutputMetadata]));

    const mock = new Mock<ModelDataProvider>();
    factory = new CadModelFactory(materialManager, modelMetadataProviderMock.object(), mock.object());
  });

  test('createModel() initializes model materials', () => {
    const addModelMaterialsSpy = jest.spyOn(materialManager, 'addModelMaterials');
    const node = factory.createModel(mockIdentifierObject);

    expect(node).toBeTruthy();
    expect(addModelMaterialsSpy).toBeCalledTimes(1);
  });

  test('createModel() sets model clipping planes when a clip box is set', () => {
    const setModelClippingPlanesSpy = jest.spyOn(materialManager, 'setModelClippingPlanes');
    (modelMetadata as Mutable<CadModelMetadata>).geometryClipBox = new THREE.Box3(
      new THREE.Vector3(-1, -2, -3),
      new THREE.Vector3(4, 5, 6)
    );

    factory.createModel(mockIdentifierObject);

    expect(setModelClippingPlanesSpy).toBeCalledTimes(1);
    expect(setModelClippingPlanesSpy).toBeCalledWith(expect.toBeString(), expect.toBeArrayOfSize(6));
  });
});
