/*!
 * Copyright 2025 Cognite AS
 */

import { jest } from '@jest/globals';
import { CogniteClient } from '@cognite/sdk';
import { It, Mock } from 'moq.ts';
import { Cdf360CdmBatchCollectionLoader } from './Cdf360CdmBatchCollectionLoader';
import { DataModelsSdk } from '../../../../DataModelsSdk';

type DmsSdkQueryResult = Awaited<ReturnType<DataModelsSdk['queryNodesAndEdges']>>;

describe(Cdf360CdmBatchCollectionLoader.name, () => {
  test('should batch multiple collection requests into a single DMS query', async () => {
    const collectionIds = ['collection_1', 'collection_2', 'collection_3'];
    const dmsResponse = createMockDmsResponse(collectionIds);
    const { cogniteSdkMock, dmsSdkMock } = createMockSdk(dmsResponse);

    const batchLoader = new Cdf360CdmBatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object());

    const results = await Promise.all(
      collectionIds.map(id => batchLoader.getCollectionDescriptors({ externalId: id, space: 'test_space' }))
    );

    expect(results).toHaveLength(3);
    results.forEach((result, idx) => {
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].collectionId).toBe(collectionIds[idx]);
    });
  });

  test('should handle collections with no images', async () => {
    const dmsResponse = {
      image_collections: [
        {
          instanceType: 'node' as const,
          version: 1,
          space: 'test_space',
          externalId: 'empty_collection',
          createdTime: 0,
          lastUpdatedTime: 0,
          properties: {
            cdf_cdm: {
              'Cognite360ImageCollection/v1': {
                name: 'Empty Collection'
              }
            }
          }
        }
      ],
      images: [],
      stations: []
    };

    const { cogniteSdkMock, dmsSdkMock } = createMockSdk(dmsResponse);
    const batchLoader = new Cdf360CdmBatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object());

    const result = await batchLoader.getCollectionDescriptors({
      externalId: 'empty_collection',
      space: 'test_space'
    });

    expect(result).toHaveLength(0);
  });

  test('should handle DMS query errors gracefully', async () => {
    const { cogniteSdkMock, dmsSdkMock } = createMockSdk(
      {
        image_collections: [],
        images: [],
        stations: []
      },
      new Error('DMS query failed')
    );

    const batchLoader = new Cdf360CdmBatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object());

    await expect(
      batchLoader.getCollectionDescriptors({ externalId: 'test_collection', space: 'test_space' })
    ).rejects.toThrow('DMS query failed');
  });

  test('should handle collection not found', async () => {
    const dmsResponse = {
      image_collections: [],
      images: [],
      stations: []
    };

    const { cogniteSdkMock, dmsSdkMock } = createMockSdk(dmsResponse);
    const batchLoader = new Cdf360CdmBatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object());

    const result = await batchLoader.getCollectionDescriptors({
      externalId: 'nonexistent_collection',
      space: 'test_space'
    });

    expect(result).toHaveLength(0);
  });

  test('file descriptors use instanceId instead of fileId', async () => {
    const collectionIds = ['collection_1'];
    const dmsResponse = createMockDmsResponse(collectionIds);
    const { cogniteSdkMock, dmsSdkMock } = createMockSdk(dmsResponse);

    const batchLoader = new Cdf360CdmBatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object());

    const results = await batchLoader.getCollectionDescriptors({
      externalId: 'collection_1',
      space: 'test_space'
    });

    expect(results.length).toBeGreaterThan(0);

    // Verify that file descriptors have instanceId, not fileId
    const firstDescriptor = results[0];
    const faceDescriptors = firstDescriptor.imageRevisions[0].faceDescriptors;

    expect(faceDescriptors.length).toBe(6);
    faceDescriptors.forEach(fd => {
      expect(fd.instanceId).toBeDefined();
      expect(fd.instanceId?.space).toBe('test_space');
      expect(fd.instanceId?.externalId).toBeDefined();
      expect(fd.fileId).toBeUndefined();
      expect(fd.mimeType).toBe('image/jpeg');
    });
  });

  test('does not call files.retrieve API', async () => {
    const filesRetrieveMock = jest.fn();
    const collectionIds = ['collection_1'];
    const dmsResponse = createMockDmsResponse(collectionIds);

    const filesApiMock = new Mock<CogniteClient['files']>()
      .setup(instance => instance.retrieve(It.IsAny()))
      .callback(() => {
        filesRetrieveMock();
        return Promise.resolve([]);
      });

    const cogniteSdkMock = new Mock<CogniteClient>()
      .setup(instance => instance.getBaseUrl())
      .returns('https://example.com')
      .setup(instance => instance.project)
      .returns('test-project')
      .setup(instance => instance.files)
      .returns(filesApiMock.object());

    const dmsSdkMock = new Mock<DataModelsSdk>()
      .setup(instance => instance.queryNodesAndEdges(It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(dmsResponse));

    const batchLoader = new Cdf360CdmBatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object());

    await batchLoader.getCollectionDescriptors({
      externalId: 'collection_1',
      space: 'test_space'
    });

    // Verify files.retrieve was NOT called (optimization)
    expect(filesRetrieveMock).not.toHaveBeenCalled();
  });

  function createMockSdk(dmsResponse: DmsSdkQueryResult, dmsError?: Error) {
    const cogniteSdkMock = new Mock<CogniteClient>()
      .setup(instance => instance.getBaseUrl())
      .returns('https://example.com')
      .setup(instance => instance.project)
      .returns('test-project');

    const dmsSdkMock = new Mock<DataModelsSdk>();

    if (dmsError) {
      dmsSdkMock
        .setup(instance => instance.queryNodesAndEdges(It.IsAny(), It.IsAny()))
        .callback(async () => {
          throw dmsError;
        });
    } else {
      dmsSdkMock
        .setup(instance => instance.queryNodesAndEdges(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(dmsResponse));
    }

    return { cogniteSdkMock, dmsSdkMock };
  }

  function createMockDmsResponse(collectionIds: string[]): DmsSdkQueryResult {
    const collections = collectionIds.map(id => ({
      instanceType: 'node' as const,
      version: 1,
      space: 'test_space',
      externalId: id,
      createdTime: 0,
      lastUpdatedTime: 0,
      properties: {
        cdf_cdm: {
          'Cognite360ImageCollection/v1': {
            name: `Collection ${id}`
          }
        }
      }
    }));

    const images = collectionIds.flatMap((collectionId, idx) =>
      Array.from({ length: 2 }, (_, imageIdx) => ({
        instanceType: 'node' as const,
        version: 1,
        space: 'test_space',
        externalId: `image_${collectionId}_${imageIdx}`,
        createdTime: 0,
        lastUpdatedTime: 0,
        properties: {
          cdf_cdm: {
            'Cognite360Image/v1': {
              top: { externalId: `file_${collectionId}_${imageIdx}_top`, space: 'test_space' },
              back: { externalId: `file_${collectionId}_${imageIdx}_back`, space: 'test_space' },
              left: { externalId: `file_${collectionId}_${imageIdx}_left`, space: 'test_space' },
              front: { externalId: `file_${collectionId}_${imageIdx}_front`, space: 'test_space' },
              right: { externalId: `file_${collectionId}_${imageIdx}_right`, space: 'test_space' },
              bottom: { externalId: `file_${collectionId}_${imageIdx}_bottom`, space: 'test_space' },
              collection360: { space: 'test_space', externalId: collectionId },
              station360: { space: 'test_space', externalId: `station_${collectionId}` },
              scaleX: 1,
              scaleY: 1,
              scaleZ: 1,
              translationX: idx,
              translationY: idx,
              translationZ: idx,
              eulerRotationX: idx,
              eulerRotationY: idx,
              eulerRotationZ: idx,
              takenAt: `2024-01-0${idx + 1}`
            }
          }
        }
      }))
    );

    return {
      image_collections: collections,
      images,
      stations: []
    };
  }
});
