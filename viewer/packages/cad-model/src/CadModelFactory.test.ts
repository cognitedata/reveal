/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { CadModelFactory } from './CadModelFactory';

import { CadMaterialManager } from '@reveal/rendering';
import { ModelDataProvider, ModelMetadataProvider, ModelIdentifier, BlobOutputMetadata } from '@reveal/modeldata-api';

import { It, Mock } from 'moq.ts';
import { GeometryFilter } from './types';

describe('CadModelFactory', () => {
  let materialManager: CadMaterialManager;
  let factory: CadModelFactory;
  let mockIdentifierObject: ModelIdentifier;

  beforeEach(() => {
    materialManager = new CadMaterialManager();

    const mockIdentifier = new Mock<ModelIdentifier>().setup(p => p.revealInternalId).returns(Symbol('test'));
    mockIdentifierObject = mockIdentifier.object();

    const testOutput: BlobOutputMetadata = { blobId: 1, format: 'reveal-directory', version: 8 };
    const testBaseUrl = 'https://test-base-url';

    const sector = {
      id: 0,
      parentId: -1,
      path: '0/',
      depth: 1,
      boundingBox: {
        min: { x: -1, y: -1, z: -1 },
        max: { x: 1, y: 1, z: 1 }
      },
      indexFile: {
        peripheralFiles: [],
        fileName: 'test.i3d',
        downloadSize: 1000
      },
      facesFile: {
        quadSize: 0.1,
        facesCount: 10,
        recursiveCoverageFactors: { yz: 0.5, xz: 0.5, xy: 0.2 },
        coverageFactors: { yz: 0.5, xz: 0.5, xy: 0.5 },
        fileName: 'test.f3d',
        downloadSize: 1000
      },
      estimatedTriangleCount: 10000,
      estimatedDrawCallCount: 20,
      maxDiagonalLength: 3.0,
      minDiagonalLength: 1.0
    };

    const modelMetadataProviderMock = new Mock<ModelMetadataProvider>()
      .setup(p => p.getModelOutputs(mockIdentifierObject))
      .returns(Promise.resolve([testOutput]))
      .setup(p => p.getModelUri(mockIdentifierObject, testOutput))
      .returns(Promise.resolve(testBaseUrl))
      .setup(p => p.getModelMatrix(mockIdentifierObject, testOutput.format))
      .returns(Promise.resolve(new THREE.Matrix4()))
      .setup(p => p.getModelCamera(mockIdentifierObject))
      .returns(Promise.resolve({ position: new THREE.Vector3(), target: new THREE.Vector3(0, 0, 1) }));

    const mock = new Mock<ModelDataProvider>()
      .setup(p => p.getJsonFile(testBaseUrl, It.IsAny<string>()))
      .returns(Promise.resolve({ version: testOutput.version, sectors: [sector] }));

    factory = new CadModelFactory(materialManager, modelMetadataProviderMock.object(), mock.object());
  });

  test('createModel() initializes model materials', async () => {
    const addModelMaterialsSpy = jest.spyOn(materialManager, 'addModelMaterials');
    const modelMetadata = await factory.loadModelMetadata(mockIdentifierObject);
    const node = await factory.createModel(modelMetadata);

    expect(node).toBeTruthy();
    expect(addModelMaterialsSpy).toBeCalledTimes(1);
  });

  test('createModel() sets model clipping planes when a clip box is set', async () => {
    const setModelClippingPlanesSpy = jest.spyOn(materialManager, 'setModelClippingPlanes');

    const geometryFilter: GeometryFilter = {
      boundingBox: new THREE.Box3(new THREE.Vector3(-1, -2, -3), new THREE.Vector3(4, 5, 6)),
      isBoundingBoxInModelCoordinates: true
    };

    const modelMetadata = await factory.loadModelMetadata(mockIdentifierObject);
    await factory.createModel(modelMetadata, geometryFilter);

    expect(setModelClippingPlanesSpy).toBeCalledTimes(1);
    expect(setModelClippingPlanesSpy).toBeCalledWith(expect.toBeString(), expect.toBeArrayOfSize(6));
  });
});
