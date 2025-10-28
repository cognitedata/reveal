/*!
 * Copyright 2025 Cognite AS
 */

import { CogniteClient, DirectRelationReference, FileInfo } from '@cognite/sdk';
import { It, Mock, Times } from 'moq.ts';
import { BatchCollectionLoader } from './BatchCollectionLoader';
import { DataModelsSdk } from '../../../../DataModelsSdk';

// Extended FileInfo with instanceId for CDM files API response
interface FileInfoWithInstanceId extends FileInfo {
  instanceId: DirectRelationReference;
}

describe(BatchCollectionLoader.name, () => {
  const createMockDmsResponse = (collectionIds: string[]) => {
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
  };

  const createMockFilesResponse = (collectionIds: string[]) => {
    const files: FileInfoWithInstanceId[] = collectionIds.flatMap((collectionId, idx) =>
      Array.from({ length: 2 }, (_, imageIdx) =>
        ['top', 'back', 'left', 'front', 'right', 'bottom'].map(face => {
          const fileId = idx * 100 + imageIdx * 10 + face.length;
          const externalId = `file_${collectionId}_${imageIdx}_${face}`;

          return new Mock<FileInfoWithInstanceId>()
            .setup(f => f.id)
            .returns(fileId)
            .setup(f => f.name)
            .returns(`${face}.jpg`)
            .setup(f => f.mimeType)
            .returns('image/jpeg')
            .setup(f => f.instanceId)
            .returns({ externalId, space: 'test_space' })
            .object();
        })
      ).flat()
    );

    return {
      data: {
        items: files
      },
      headers: {},
      status: 200
    };
  };

  test('should batch multiple collection requests into a single DMS query', async () => {
    const collectionIds = ['collection_1', 'collection_2', 'collection_3'];
    const dmsResponse = createMockDmsResponse(collectionIds);
    const filesResponse = createMockFilesResponse(collectionIds);

    const cogniteSdkMock = new Mock<CogniteClient>()
      .setup(instance =>
        instance.post(
          It.Is((path: string) => path.includes('files/byids')),
          It.IsAny()
        )
      )
      .returns(Promise.resolve(filesResponse))
      .setup(instance => instance.getBaseUrl())
      .returns('https://example.com')
      .setup(instance => instance.project)
      .returns('test-project');

    const dmsSdkMock = new Mock<DataModelsSdk>()
      .setup(instance => instance.queryNodesAndEdges(It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(dmsResponse));

    const batchLoader = new BatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object());

    // Request all 3 collections concurrently
    const results = await Promise.all(
      collectionIds.map(id => batchLoader.getCollectionDescriptors({ externalId: id, space: 'test_space' }))
    );

    // Verify that only 1 DMS query was made (batching worked)
    dmsSdkMock.verify(instance => instance.queryNodesAndEdges(It.IsAny(), It.IsAny()), Times.Once());

    // Verify results
    expect(results).toHaveLength(3);
    results.forEach((result, idx) => {
      expect(result).toHaveLength(2); // 2 images per collection
      expect(result[0].collectionId).toBe(collectionIds[idx]);
      expect(result[0].collectionLabel).toBe(`Collection ${collectionIds[idx]}`);
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

    const cogniteSdkMock = new Mock<CogniteClient>()
      .setup(instance => instance.getBaseUrl())
      .returns('https://example.com')
      .setup(instance => instance.project)
      .returns('test-project');

    const dmsSdkMock = new Mock<DataModelsSdk>()
      .setup(instance => instance.queryNodesAndEdges(It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(dmsResponse));

    const batchLoader = new BatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object());

    const result = await batchLoader.getCollectionDescriptors({
      externalId: 'empty_collection',
      space: 'test_space'
    });

    expect(result).toHaveLength(0);
  });

  test('should batch requests that arrive within delay window', async () => {
    const collectionIds = ['collection_1', 'collection_2'];
    const dmsResponse = createMockDmsResponse(collectionIds);
    const filesResponse = createMockFilesResponse(collectionIds);

    const cogniteSdkMock = new Mock<CogniteClient>()
      .setup(instance =>
        instance.post(
          It.Is((path: string) => path.includes('files/byids')),
          It.IsAny()
        )
      )
      .returns(Promise.resolve(filesResponse))
      .setup(instance => instance.getBaseUrl())
      .returns('https://example.com')
      .setup(instance => instance.project)
      .returns('test-project');

    const dmsSdkMock = new Mock<DataModelsSdk>()
      .setup(instance => instance.queryNodesAndEdges(It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(dmsResponse));

    const batchLoader = new BatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object(), {
      batchSize: 10,
      batchDelayMs: 50
    });

    // Request first collection
    const promise1 = batchLoader.getCollectionDescriptors({
      externalId: 'collection_1',
      space: 'test_space'
    });

    // Request second collection after 20ms (within batch delay)
    await new Promise(resolve => setTimeout(resolve, 20));
    const promise2 = batchLoader.getCollectionDescriptors({
      externalId: 'collection_2',
      space: 'test_space'
    });

    const results = await Promise.all([promise1, promise2]);

    // Should still be batched into 1 query
    dmsSdkMock.verify(instance => instance.queryNodesAndEdges(It.IsAny(), It.IsAny()), Times.Once());
    expect(results).toHaveLength(2);
  });

  test('should handle DMS query errors gracefully', async () => {
    const cogniteSdkMock = new Mock<CogniteClient>()
      .setup(instance => instance.getBaseUrl())
      .returns('https://example.com')
      .setup(instance => instance.project)
      .returns('test-project');

    const dmsSdkMock = new Mock<DataModelsSdk>()
      .setup(instance => instance.queryNodesAndEdges(It.IsAny(), It.IsAny()))
      .returns(Promise.reject(new Error('DMS query failed')));

    const batchLoader = new BatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object());

    await expect(
      batchLoader.getCollectionDescriptors({ externalId: 'test_collection', space: 'test_space' })
    ).rejects.toThrow('DMS query failed');
  });

  test('should handle file fetching errors gracefully', async () => {
    const dmsResponse = createMockDmsResponse(['collection_1']);

    const cogniteSdkMock = new Mock<CogniteClient>()
      .setup(instance =>
        instance.post(
          It.Is((path: string) => path.includes('files/byids')),
          It.IsAny()
        )
      )
      .returns(Promise.reject(new Error('Files API failed')))
      .setup(instance => instance.getBaseUrl())
      .returns('https://example.com')
      .setup(instance => instance.project)
      .returns('test-project');

    const dmsSdkMock = new Mock<DataModelsSdk>()
      .setup(instance => instance.queryNodesAndEdges(It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(dmsResponse));

    const batchLoader = new BatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object());

    await expect(
      batchLoader.getCollectionDescriptors({ externalId: 'collection_1', space: 'test_space' })
    ).rejects.toThrow();
  });

  test('should handle collection not found', async () => {
    const dmsResponse = {
      image_collections: [],
      images: [],
      stations: []
    };

    const cogniteSdkMock = new Mock<CogniteClient>()
      .setup(instance => instance.getBaseUrl())
      .returns('https://example.com')
      .setup(instance => instance.project)
      .returns('test-project');

    const dmsSdkMock = new Mock<DataModelsSdk>()
      .setup(instance => instance.queryNodesAndEdges(It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(dmsResponse));

    const batchLoader = new BatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object());

    const result = await batchLoader.getCollectionDescriptors({
      externalId: 'nonexistent_collection',
      space: 'test_space'
    });

    expect(result).toHaveLength(0);
  });

  test('should execute batches immediately when batch size is reached', async () => {
    const collectionIds = ['c1', 'c2', 'c3'];
    const dmsResponse = createMockDmsResponse(collectionIds);
    const filesResponse = createMockFilesResponse(collectionIds);

    const cogniteSdkMock = new Mock<CogniteClient>()
      .setup(instance =>
        instance.post(
          It.Is((path: string) => path.includes('files/byids')),
          It.IsAny()
        )
      )
      .returns(Promise.resolve(filesResponse))
      .setup(instance => instance.getBaseUrl())
      .returns('https://example.com')
      .setup(instance => instance.project)
      .returns('test-project');

    const dmsSdkMock = new Mock<DataModelsSdk>()
      .setup(instance => instance.queryNodesAndEdges(It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(dmsResponse));

    // Set batch size to 2, so 3rd request should trigger immediate execution
    const batchLoader = new BatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object(), {
      batchSize: 2,
      batchDelayMs: 1000
    });

    const results = await Promise.all(
      collectionIds.map(id => batchLoader.getCollectionDescriptors({ externalId: id, space: 'test_space' }))
    );

    // Should make 2 batches: first 2 collections in one batch, 3rd in another
    dmsSdkMock.verify(instance => instance.queryNodesAndEdges(It.IsAny(), It.IsAny()), Times.Exactly(2));
    expect(results).toHaveLength(3);
  });
});
