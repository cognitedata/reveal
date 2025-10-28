/*!
 * Copyright 2025 Cognite AS
 */

import { CogniteClient, CogniteEvent, FileInfo } from '@cognite/sdk';
import { Cdf360BatchEventCollectionLoader } from './Cdf360BatchEventCollectionLoader';
import { Mock } from 'moq.ts';

// Helper types for type-safe mocking
type EventsApi = Pick<CogniteClient['events'], 'list'>;
type FilesApi = Pick<CogniteClient['files'], 'list'>;

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

    const eventsApi: EventsApi = {
      list: () => {
        eventsListCallCount++;
        return {
          autoPagingToArray: async (): Promise<CogniteEvent[]> => allEvents
        } as ReturnType<EventsApi['list']>;
      }
    };

    const filesApi: FilesApi = {
      list: () =>
        ({
          autoPagingEach: async (callback: (file: FileInfo) => void): Promise<void> => {
            allFiles.forEach(callback);
          }
        }) as unknown as ReturnType<FilesApi['list']>
    };

    const clientMock = new Mock<CogniteClient>()
      .setup(instance => instance.events)
      .returns(eventsApi as CogniteClient['events'])
      .setup(instance => instance.files)
      .returns(filesApi as CogniteClient['files']);

    const batchLoader = new Cdf360BatchEventCollectionLoader(clientMock.object());

    // Make 3 concurrent requests - they should be batched
    const resultsPromise = Promise.all([
      batchLoader.getCollectionDescriptors({ site_id: 'site1' }, false),
      batchLoader.getCollectionDescriptors({ site_id: 'site2' }, false),
      batchLoader.getCollectionDescriptors({ site_id: 'site3' }, false)
    ]);

    const results = await resultsPromise;

    // KEY BATCHING VALIDATION: With 3 sites and 10 partitions per request,
    // individual requests would make 30 API calls (3 × 10).
    // Batching should reduce this to just 10 calls (1 batch × 10 partitions).
    expect(eventsListCallCount).toBe(10);

    // Verify we got 3 results (one per site)
    expect(results).toHaveLength(3);
  });

  test('should handle sites with no events or files', async () => {
    const eventsApi: EventsApi = {
      list: () =>
        ({
          autoPagingToArray: async (): Promise<CogniteEvent[]> => []
        }) as ReturnType<EventsApi['list']>
    };

    const filesApi: FilesApi = {
      list: () =>
        ({
          autoPagingEach: async (): Promise<void> => {}
        }) as unknown as ReturnType<FilesApi['list']>
    };

    const clientMock = new Mock<CogniteClient>()
      .setup(instance => instance.events)
      .returns(eventsApi as CogniteClient['events'])
      .setup(instance => instance.files)
      .returns(filesApi as CogniteClient['files']);

    const batchLoader = new Cdf360BatchEventCollectionLoader(clientMock.object());
    const result = await batchLoader.getCollectionDescriptors({ site_id: 'empty_site' }, false);

    expect(result.length).toBe(0);
  });

  test('should handle API errors gracefully', async () => {
    const eventsApi: EventsApi = {
      list: () =>
        ({
          autoPagingToArray: async (): Promise<CogniteEvent[]> => {
            throw new Error('Events API failed');
          }
        }) as ReturnType<EventsApi['list']>
    };

    const filesApi: FilesApi = {
      list: () =>
        ({
          autoPagingEach: async (): Promise<void> => {}
        }) as unknown as ReturnType<FilesApi['list']>
    };

    const clientMock = new Mock<CogniteClient>()
      .setup(instance => instance.events)
      .returns(eventsApi as CogniteClient['events'])
      .setup(instance => instance.files)
      .returns(filesApi as CogniteClient['files']);

    const batchLoader = new Cdf360BatchEventCollectionLoader(clientMock.object());

    await expect(batchLoader.getCollectionDescriptors({ site_id: 'test_site' }, false)).rejects.toThrow(
      'Events API failed'
    );
  });

  test('should filter out incomplete file sets', async () => {
    const events = [createMockEvent('site1', 'station1', 1)];
    // Only 4 files instead of 6 - incomplete set
    const incompleteFiles = createMockFiles('site1', 'station1', 100).slice(0, 4);

    const eventsApi: EventsApi = {
      list: () =>
        ({
          autoPagingToArray: async (): Promise<CogniteEvent[]> => events
        }) as ReturnType<EventsApi['list']>
    };

    const filesApi: FilesApi = {
      list: () =>
        ({
          autoPagingEach: async (callback: (file: FileInfo) => void): Promise<void> => {
            incompleteFiles.forEach(callback);
          }
        }) as unknown as ReturnType<FilesApi['list']>
    };

    const clientMock = new Mock<CogniteClient>()
      .setup(instance => instance.events)
      .returns(eventsApi as CogniteClient['events'])
      .setup(instance => instance.files)
      .returns(filesApi as CogniteClient['files']);

    const batchLoader = new Cdf360BatchEventCollectionLoader(clientMock.object());
    const result = await batchLoader.getCollectionDescriptors({ site_id: 'site1' }, false);

    // Should return empty because file set is incomplete (needs 6 faces, only has 4)
    expect(result.length).toBe(0);
  });

  test('should deduplicate requests for the same site within batch window', async () => {
    const events = [createMockEvent('site1', 'station1', 1)];
    const files = createMockFiles('site1', 'station1', 100);

    let batchExecutionCount = 0;

    const eventsApi: EventsApi = {
      list: () => {
        batchExecutionCount++;
        return {
          autoPagingToArray: async (): Promise<CogniteEvent[]> => events
        } as ReturnType<EventsApi['list']>;
      }
    };

    const filesApi: FilesApi = {
      list: () =>
        ({
          autoPagingEach: async (callback: (file: FileInfo) => void): Promise<void> => {
            files.forEach(callback);
          }
        }) as unknown as ReturnType<FilesApi['list']>
    };

    const clientMock = new Mock<CogniteClient>()
      .setup(instance => instance.events)
      .returns(eventsApi as CogniteClient['events'])
      .setup(instance => instance.files)
      .returns(filesApi as CogniteClient['files']);

    const batchLoader = new Cdf360BatchEventCollectionLoader(clientMock.object());

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

  // Helper to create mock event
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

  // Helper to create mock files for a station
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
