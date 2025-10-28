/*!
 * Copyright 2025 Cognite AS
 */

import { CogniteClient, CogniteEvent, FileInfo, CursorAndAsyncIterator } from '@cognite/sdk';
import { It, Mock } from 'moq.ts';
import { BatchEventCollectionLoader } from './BatchEventCollectionLoader';

describe(BatchEventCollectionLoader.name, () => {
  // Helper to create a mock CursorAndAsyncIterator for events
  function createEventsMock(events: CogniteEvent[]): CursorAndAsyncIterator<CogniteEvent> {
    const mock = new Mock<CursorAndAsyncIterator<CogniteEvent>>()
      .setup(instance => instance.autoPagingToArray())
      .returns(Promise.resolve(events));
    return mock.object();
  }

  // Helper to create a mock CursorAndAsyncIterator for files
  function createFilesMock(files: FileInfo[]): CursorAndAsyncIterator<FileInfo> {
    const mock = new Mock<CursorAndAsyncIterator<FileInfo>>();

    // Create a function that matches the autoPagingEach signature
    const autoPagingEachImpl = (cb: (file: FileInfo) => void) => {
      files.forEach(cb);
      return Promise.resolve();
    };

    mock.setup(instance => instance.autoPagingEach).returns(autoPagingEachImpl);

    return mock.object();
  }

  const createMockEvents = (siteIds: string[]): CogniteEvent[] => {
    return siteIds.flatMap((siteId, idx) =>
      Array.from({ length: 2 }, (_, stationIdx) => {
        const eventId = idx * 10 + stationIdx;
        const now = new Date();

        return new Mock<CogniteEvent>()
          .setup(e => e.id)
          .returns(eventId)
          .setup(e => e.createdTime)
          .returns(now)
          .setup(e => e.lastUpdatedTime)
          .returns(now)
          .setup(e => e.metadata)
          .returns({
            site_id: siteId,
            site_name: `Site ${siteId}`,
            station_id: `station_${siteId}_${stationIdx}`,
            station_name: `Station ${stationIdx}`,
            rotation_angle: '0',
            rotation_axis: '0,1,0',
            translation: '0,0,0'
          })
          .object();
      })
    );
  };

  const createMockFiles = (siteIds: string[]): FileInfo[] => {
    return siteIds.flatMap((siteId, idx) =>
      Array.from({ length: 2 }, (_, stationIdx) =>
        ['front', 'back', 'left', 'right', 'top', 'bottom'].map(face => {
          const fileId = idx * 100 + stationIdx * 10 + face.length;

          return new Mock<FileInfo>()
            .setup(f => f.id)
            .returns(fileId)
            .setup(f => f.name)
            .returns(`${face}.jpg`)
            .setup(f => f.mimeType)
            .returns('image/jpeg')
            .setup(f => f.uploaded)
            .returns(true)
            .setup(f => f.metadata)
            .returns({
              site_id: siteId,
              station_id: `station_${siteId}_${stationIdx}`,
              face,
              timestamp: `${1000 + stationIdx}`
            })
            .object();
        })
      ).flat()
    );
  };

  test('should batch multiple site requests into fewer API calls', async () => {
    const siteIds = ['site_1', 'site_2', 'site_3'];
    const mockEvents = createMockEvents(siteIds);
    const mockFiles = createMockFiles(siteIds);

    let eventsCallCount = 0;
    let filesCallCount = 0;

    // Mock events API
    const eventsApiMock = new Mock<CogniteClient['events']>()
      .setup(instance => instance.list(It.IsAny()))
      .callback(() => {
        eventsCallCount++;
        return createEventsMock(mockEvents);
      });

    // Mock files API
    const filesApiMock = new Mock<CogniteClient['files']>()
      .setup(instance => instance.list(It.IsAny()))
      .callback(() => {
        filesCallCount++;
        return createFilesMock(mockFiles);
      });

    const clientMock = new Mock<CogniteClient>()
      .setup(instance => instance.events)
      .returns(eventsApiMock.object())
      .setup(instance => instance.files)
      .returns(filesApiMock.object());

    const batchLoader = new BatchEventCollectionLoader(clientMock.object());

    // Request all 3 sites concurrently
    const results = await Promise.all(
      siteIds.map(siteId => batchLoader.getCollectionDescriptors({ site_id: siteId }, false))
    );

    // Should make 10 partition calls each for events and files (not 30 calls)
    expect(eventsCallCount).toBe(10); // 1 batch × 10 partitions
    expect(filesCallCount).toBe(10); // 1 batch × 10 partitions

    // Verify results
    expect(results).toHaveLength(3);
    results.forEach((result, idx) => {
      expect(result).toHaveLength(2); // 2 stations per site
      expect(result[0].collectionId).toBe(siteIds[idx]);
      expect(result[0].collectionLabel).toBe(`Site ${siteIds[idx]}`);
    });
  });

  test('should handle sites with no events or files', async () => {
    const eventsApiMock = new Mock<CogniteClient['events']>()
      .setup(instance => instance.list(It.IsAny()))
      .callback(() => createEventsMock([]));

    const filesApiMock = new Mock<CogniteClient['files']>()
      .setup(instance => instance.list(It.IsAny()))
      .callback(() => createFilesMock([]));

    const clientMock = new Mock<CogniteClient>()
      .setup(instance => instance.events)
      .returns(eventsApiMock.object())
      .setup(instance => instance.files)
      .returns(filesApiMock.object());

    const batchLoader = new BatchEventCollectionLoader(clientMock.object());

    const result = await batchLoader.getCollectionDescriptors({ site_id: 'empty_site' }, false);

    expect(result).toHaveLength(0);
  });

  test('should batch requests that arrive within delay window', async () => {
    const siteIds = ['site_1', 'site_2'];
    const mockEvents = createMockEvents(siteIds);
    const mockFiles = createMockFiles(siteIds);

    let eventsCallCount = 0;

    const eventsApiMock = new Mock<CogniteClient['events']>()
      .setup(instance => instance.list(It.IsAny()))
      .callback(() => {
        eventsCallCount++;
        return createEventsMock(mockEvents);
      });

    const filesApiMock = new Mock<CogniteClient['files']>()
      .setup(instance => instance.list(It.IsAny()))
      .callback(() => createFilesMock(mockFiles));

    const clientMock = new Mock<CogniteClient>()
      .setup(instance => instance.events)
      .returns(eventsApiMock.object())
      .setup(instance => instance.files)
      .returns(filesApiMock.object());

    const batchLoader = new BatchEventCollectionLoader(clientMock.object(), {
      batchSize: 10,
      batchDelayMs: 50
    });

    // Request first site
    const promise1 = batchLoader.getCollectionDescriptors({ site_id: 'site_1' }, false);

    // Request second site after 20ms (within batch delay)
    await new Promise(resolve => setTimeout(resolve, 20));
    const promise2 = batchLoader.getCollectionDescriptors({ site_id: 'site_2' }, false);

    const results = await Promise.all([promise1, promise2]);

    // Should still be batched into 1 query (10 partitions)
    expect(eventsCallCount).toBe(10);
    expect(results).toHaveLength(2);
  });

  test('should handle API errors gracefully', async () => {
    const eventsMockWithError = new Mock<CursorAndAsyncIterator<CogniteEvent>>()
      .setup(instance => instance.autoPagingToArray())
      .returns(Promise.reject(new Error('Events API failed')));

    const eventsApiMock = new Mock<CogniteClient['events']>()
      .setup(instance => instance.list(It.IsAny()))
      .callback(() => eventsMockWithError.object());

    const clientMock = new Mock<CogniteClient>().setup(instance => instance.events).returns(eventsApiMock.object());

    const batchLoader = new BatchEventCollectionLoader(clientMock.object());

    await expect(batchLoader.getCollectionDescriptors({ site_id: 'test_site' }, false)).rejects.toThrow(
      'Events API failed'
    );
  });

  test('should filter out incomplete file sets', async () => {
    const now = new Date();
    const mockEvents: CogniteEvent[] = [
      new Mock<CogniteEvent>()
        .setup(e => e.id)
        .returns(1)
        .setup(e => e.createdTime)
        .returns(now)
        .setup(e => e.lastUpdatedTime)
        .returns(now)
        .setup(e => e.metadata)
        .returns({
          site_id: 'site_1',
          station_id: 'station_1',
          rotation_angle: '0',
          rotation_axis: '0,1,0',
          translation: '0,0,0'
        })
        .object()
    ];

    // Only 5 faces instead of 6
    const incompleteFiles: FileInfo[] = ['front', 'back', 'left', 'right', 'top'].map((face, idx) =>
      new Mock<FileInfo>()
        .setup(f => f.id)
        .returns(idx)
        .setup(f => f.name)
        .returns(`${face}.jpg`)
        .setup(f => f.mimeType)
        .returns('image/jpeg')
        .setup(f => f.uploaded)
        .returns(true)
        .setup(f => f.metadata)
        .returns({
          site_id: 'site_1',
          station_id: 'station_1',
          face,
          timestamp: '1000'
        })
        .object()
    );

    const eventsApiMock = new Mock<CogniteClient['events']>()
      .setup(instance => instance.list(It.IsAny()))
      .callback(() => createEventsMock(mockEvents));

    const filesApiMock = new Mock<CogniteClient['files']>()
      .setup(instance => instance.list(It.IsAny()))
      .callback(() => createFilesMock(incompleteFiles));

    const clientMock = new Mock<CogniteClient>()
      .setup(instance => instance.events)
      .returns(eventsApiMock.object())
      .setup(instance => instance.files)
      .returns(filesApiMock.object());

    const batchLoader = new BatchEventCollectionLoader(clientMock.object());

    const result = await batchLoader.getCollectionDescriptors({ site_id: 'site_1' }, false);

    // Should return empty because file set is incomplete
    expect(result).toHaveLength(0);
  });

  test('should execute batches immediately when batch size is reached', async () => {
    const siteIds = ['s1', 's2', 's3'];
    const mockEvents = createMockEvents(siteIds);
    const mockFiles = createMockFiles(siteIds);

    let eventsCallCount = 0;

    const eventsApiMock = new Mock<CogniteClient['events']>()
      .setup(instance => instance.list(It.IsAny()))
      .callback(() => {
        eventsCallCount++;
        return createEventsMock(mockEvents);
      });

    const filesApiMock = new Mock<CogniteClient['files']>()
      .setup(instance => instance.list(It.IsAny()))
      .callback(() => createFilesMock(mockFiles));

    const clientMock = new Mock<CogniteClient>()
      .setup(instance => instance.events)
      .returns(eventsApiMock.object())
      .setup(instance => instance.files)
      .returns(filesApiMock.object());

    // Set batch size to 2, so 3rd request should trigger a second batch
    const batchLoader = new BatchEventCollectionLoader(clientMock.object(), {
      batchSize: 2,
      batchDelayMs: 1000
    });

    const results = await Promise.all(
      siteIds.map(siteId => batchLoader.getCollectionDescriptors({ site_id: siteId }, false))
    );

    // Should make 2 batches: 10 partitions × 2 batches = 20 calls
    expect(eventsCallCount).toBe(20);
    expect(results).toHaveLength(3);
  });

  test('should handle preMultipliedRotation parameter correctly', async () => {
    const mockEvents = createMockEvents(['site_1']);
    const mockFiles = createMockFiles(['site_1']);

    const eventsApiMock = new Mock<CogniteClient['events']>()
      .setup(instance => instance.list(It.IsAny()))
      .callback(() => createEventsMock(mockEvents));

    const filesApiMock = new Mock<CogniteClient['files']>()
      .setup(instance => instance.list(It.IsAny()))
      .callback(() => createFilesMock(mockFiles));

    const clientMock = new Mock<CogniteClient>()
      .setup(instance => instance.events)
      .returns(eventsApiMock.object())
      .setup(instance => instance.files)
      .returns(filesApiMock.object());

    const batchLoader = new BatchEventCollectionLoader(clientMock.object());

    // Test with both true and false
    const resultTrue = await batchLoader.getCollectionDescriptors({ site_id: 'site_1' }, true);
    const resultFalse = await batchLoader.getCollectionDescriptors({ site_id: 'site_1' }, false);

    expect(resultTrue).toHaveLength(2);
    expect(resultFalse).toHaveLength(2);

    // The transforms should be different based on preMultipliedRotation
    expect(resultTrue[0].transform).not.toEqual(resultFalse[0].transform);
  });
});
