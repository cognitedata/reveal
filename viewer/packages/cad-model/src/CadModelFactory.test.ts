/*!
 * Copyright 2021 Cognite AS
 */
import { Box3, Matrix4, Vector3 } from 'three';

import { CadModelFactory } from './CadModelFactory';

import { CadMaterialManager } from '@reveal/rendering';
import type {
  ModelDataProvider,
  ModelMetadataProvider,
  ModelIdentifier,
  BlobOutputMetadata
} from '@reveal/data-providers';
import { LocalModelIdentifier } from '@reveal/data-providers';

import { It, Mock } from 'moq.ts';
import type { GeometryFilter } from './types';

import { vi } from 'vitest';

describe(CadModelFactory.name, () => {
  let materialManager: CadMaterialManager;
  let factory: CadModelFactory;
  let mockIdentifier: ModelIdentifier;

  beforeEach(() => {
    materialManager = new CadMaterialManager();
    mockIdentifier = new LocalModelIdentifier('test-model');

    const testOutput: BlobOutputMetadata = { blobId: 1, format: 'gltf-directory', version: 9 };
    const testBaseUrl = 'https://test-base-url';

    const sector = {
      id: 0,
      sectorFileName: '0.glb',
      path: '0/',
      depth: 0,
      boundingBox: {
        min: { x: -1, y: -1, z: -1 },
        max: { x: 1, y: 1, z: 1 }
      },
      estimatedTriangleCount: 10000,
      estimatedDrawCallCount: 20,
      minDiagonalLength: 3.0,
      maxDiagonalLength: 1.0,
      downloadSize: 16334
    };

    const modelMetadataProviderMock = new Mock<ModelMetadataProvider>()
      .setup(p => p.getModelOutputs(mockIdentifier))
      .returns(Promise.resolve([testOutput]))
      .setup(p => p.getModelUri(mockIdentifier, testOutput))
      .returns(Promise.resolve(testBaseUrl))
      .setup(p => p.getModelMatrix(mockIdentifier, testOutput.format))
      .returns(Promise.resolve(new Matrix4()))
      .setup(p => p.getModelCamera(mockIdentifier))
      .returns(Promise.resolve({ position: new Vector3(), target: new Vector3(0, 0, 1) }));

    const mock = new Mock<ModelDataProvider>()
      .setup(p => p.getJsonFile(testBaseUrl, It.IsAny<string>()))
      .returns(Promise.resolve({ version: testOutput.version, sectors: [sector] }));

    factory = new CadModelFactory(materialManager, modelMetadataProviderMock.object(), mock.object());
  });

  test('createModel() initializes model materials', async () => {
    const addModelMaterialsSpy = vi.spyOn(materialManager, 'addModelMaterials');
    const modelMetadata = await factory.loadModelMetadata(mockIdentifier);
    const node = factory.createModel(modelMetadata);

    expect(node).toBeTruthy();
    expect(addModelMaterialsSpy).toHaveBeenCalledTimes(1);
  });

  test('createModel() sets model clipping planes when a clip box is set', async () => {
    const geometryFilter: GeometryFilter = {
      boundingBox: new Box3(new Vector3(-1, -2, -3), new Vector3(4, 5, 6)),
      isBoundingBoxInModelCoordinates: true
    };

    const modelMetadata = await factory.loadModelMetadata(mockIdentifier);
    const cadNode = factory.createModel(modelMetadata, geometryFilter);

    expect(cadNode.clippingPlanes.length).equals(6);
  });
});
