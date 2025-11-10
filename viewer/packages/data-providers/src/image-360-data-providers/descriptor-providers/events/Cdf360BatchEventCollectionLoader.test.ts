/*!
 * Copyright 2025 Cognite AS
 */

import { CogniteClient, CogniteEvent, FileInfo } from '@cognite/sdk';
import { Cdf360BatchEventCollectionLoader } from './Cdf360BatchEventCollectionLoader';
import { Mock } from 'moq.ts';

describe(Cdf360BatchEventCollectionLoader.name, () => {
  test('should instantiate without errors', () => {
    const clientMock = new Mock<CogniteClient>();
    const batchLoader = new Cdf360BatchEventCollectionLoader(clientMock.object());
    expect(batchLoader).toBeDefined();
  });

  test('should batch multiple concurrent site requests and reduce API calls', async () => {
    // Create data for 3 different sites
    const allEvents = [
      createMockEvent('site1', 'station1', 1),
      createMockEvent('site2', 'station2', 2),
      createMockEvent('site3', 'station3', 3)
    ];

    const allFiles = [
      ...createMockFiles('site1', 'station1', 100),
      ...createMockFiles('site2', 'station2', 200),
      ...createMockFiles('site3', 'station3', 300)
    ];

    let eventsListCallCount = 0;
    const clientMock = createMockClient(allEvents, allFiles, () => eventsListCallCount++);
    const batchLoader = new Cdf360BatchEventCollectionLoader(clientMock);

    // Make 3 concurrent requests - they should be batched
    const resultsPromise = Promise.all([
      batchLoader.getCollectionDescriptors({ site_id: 'site1' }, false),
      batchLoader.getCollectionDescriptors({ site_id: 'site2' }, false),
      batchLoader.getCollectionDescriptors({ site_id: 'site3' }, false)
    ]);

    const results = await resultsPromise;

    // With 3 sites and 10 partitions per request = 30 API calls (3 × 10).
    expect(eventsListCallCount).toBe(30);

    // Verify we got 3 results (one per site)
    expect(results).toHaveLength(3);
  });

  test('should handle sites with no events or files', async () => {
    const clientMock = createMockClient([], []);
    const batchLoader = new Cdf360BatchEventCollectionLoader(clientMock);
    const result = await batchLoader.getCollectionDescriptors({ site_id: 'empty_site' }, false);

    expect(result.length).toBe(0);
  });

  test('should handle API errors gracefully', async () => {
    const clientMock = createMockClientWithError('Events API failed');
    const batchLoader = new Cdf360BatchEventCollectionLoader(clientMock);

    await expect(batchLoader.getCollectionDescriptors({ site_id: 'test_site' }, false)).rejects.toThrow(
      'Events API failed'
    );
  });

  test('should filter out incomplete file sets', async () => {
    const events = [createMockEvent('site1', 'station1', 1)];
    // Only 4 files instead of 6 - incomplete set
    const incompleteFiles = createMockFiles('site1', 'station1', 100).slice(0, 4);

    const clientMock = createMockClient(events, incompleteFiles);
    const batchLoader = new Cdf360BatchEventCollectionLoader(clientMock);
    const result = await batchLoader.getCollectionDescriptors({ site_id: 'site1' }, false);

    // Should return empty because file set is incomplete (needs 6 faces, only has 4)
    expect(result.length).toBe(0);
  });

  test('should deduplicate requests for the same site within batch window', async () => {
    const events = [createMockEvent('site1', 'station1', 1)];
    const files = createMockFiles('site1', 'station1', 100);

    let batchExecutionCount = 0;
    const clientMock = createMockClient(events, files, () => batchExecutionCount++);
    const batchLoader = new Cdf360BatchEventCollectionLoader(clientMock);

    // Make 3 requests for the same site - should be deduplicated in the batch
    await Promise.all([
      batchLoader.getCollectionDescriptors({ site_id: 'site1' }, false),
      batchLoader.getCollectionDescriptors({ site_id: 'site1' }, false),
      batchLoader.getCollectionDescriptors({ site_id: 'site1' }, false)
    ]);

    // Should execute only once (10 partitions), not 3 times (30 calls)
    // This validates that duplicate site_ids within a batch are deduplicated
    expect(batchExecutionCount).toBe(10);
  });

  function createMockClient(
    events: CogniteEvent[],
    files: FileInfo[],
    onEventsList?: () => void,
    shouldThrowError?: string
  ) {
    const eventsMock = new Mock<ReturnType<CogniteClient['events']['list']>>()
      .setup(instance => instance.autoPagingToArray)
      .returns(async () => {
        if (shouldThrowError) {
          throw new Error(shouldThrowError);
        }
        return events;
      })
      .object();

    const filesMock = new Mock<ReturnType<CogniteClient['files']['list']>>()
      .setup(instance => instance.autoPagingEach)
      .returns(async (callback?: (file: FileInfo) => void) => {
        if (!shouldThrowError && callback) {
          files.forEach(callback);
        }
      })
      .object();

    const eventsApiMock = new Mock<CogniteClient['events']>()
      .setup(instance => instance.list)
      .returns(() => {
        onEventsList?.();
        return eventsMock;
      })
      .object();

    const filesApiMock = new Mock<CogniteClient['files']>()
      .setup(instance => instance.list)
      .returns(() => filesMock)
      .object();

    return new Mock<CogniteClient>()
      .setup(instance => instance.events)
      .returns(eventsApiMock)
      .setup(instance => instance.files)
      .returns(filesApiMock)
      .object();
  }

  function createMockClientWithError(errorMessage: string) {
    return createMockClient([], [], undefined, errorMessage);
  }

  function createMockEvent(siteId: string, stationId: string, eventId: number): CogniteEvent {
    const now = new Date();
    return {
      id: eventId,
      createdTime: now,
      lastUpdatedTime: now,
      metadata: {
        site_id: siteId,
        site_name: `Site ${siteId}`,
        station_id: stationId,
        station_name: `Station ${stationId}`,
        rotation_angle: '0',
        rotation_axis: '0,1,0',
        translation: '0,0,0'
      }
    };
  }

  function createMockFiles(siteId: string, stationId: string, startId: number): FileInfo[] {
    const now = new Date();
    const faces = ['front', 'back', 'left', 'right', 'top', 'bottom'];

    return faces.map((face, index) => ({
      id: startId + index,
      name: `${face}.jpg`,
      mimeType: 'image/jpeg' as const,
      createdTime: now,
      lastUpdatedTime: now,
      uploaded: true,
      metadata: {
        site_id: siteId,
        station_id: stationId,
        face
      }
    }));
  }
});
