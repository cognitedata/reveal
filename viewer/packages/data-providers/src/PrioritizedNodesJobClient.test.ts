/*!
 * Copyright 2026 Cognite AS
 */

import { jest } from '@jest/globals';
import { CogniteClient } from '@cognite/sdk';
import { PrioritizedNodesJobClient, PrioritizedNodesJobResponse } from './PrioritizedNodesJobClient';

function makeMockClient(
  postImpl?: (url: string, options: unknown) => Promise<{ status: number; data: unknown }>,
  getImpl?: (url: string) => Promise<{ status: number; data: unknown }>
): CogniteClient {
  return {
    getBaseUrl: () => 'https://api.cognitedata.com',
    project: 'testproject',
    post: postImpl ?? jest.fn(),
    get: getImpl ?? jest.fn()
  } as unknown as CogniteClient;
}

const baseJob: PrioritizedNodesJobResponse = {
  jobId: 42,
  modelId: 100,
  revisionId: 200,
  status: 'Queued',
  createdTime: 1000000
};

describe(PrioritizedNodesJobClient.name, () => {
  describe('startJob', () => {
    test('returns job response on HTTP 201', async () => {
      const client = makeMockClient(() => Promise.resolve({ status: 201, data: baseJob }));
      const jobClient = new PrioritizedNodesJobClient(client);

      const result = await jobClient.startJob({ modelId: 100, revisionId: 200, nodeIds: [1, 2, 3] });

      expect(result).toEqual(baseJob);
    });

    test('returns job response on HTTP 200', async () => {
      const client = makeMockClient(() => Promise.resolve({ status: 200, data: baseJob }));
      const jobClient = new PrioritizedNodesJobClient(client);

      const result = await jobClient.startJob({ modelId: 100, revisionId: 200, nodeIds: [] });

      expect(result).toEqual(baseJob);
    });

    test('throws on unexpected HTTP status', async () => {
      const client = makeMockClient(() => Promise.resolve({ status: 400, data: { message: 'Bad Request' } }));
      const jobClient = new PrioritizedNodesJobClient(client);

      await expect(jobClient.startJob({ modelId: 100, revisionId: 200, nodeIds: [] })).rejects.toThrow(
        'Failed to start PrioritizedNodes job'
      );
    });
  });

  describe('getJobStatus', () => {
    test('returns job response on HTTP 200', async () => {
      const completed = { ...baseJob, status: 'Completed' as const };
      const client = makeMockClient(undefined, () => Promise.resolve({ status: 200, data: completed }));
      const jobClient = new PrioritizedNodesJobClient(client);

      const result = await jobClient.getJobStatus(42);

      expect(result.status).toBe('Completed');
    });

    test('throws on unexpected HTTP status', async () => {
      const client = makeMockClient(undefined, () => Promise.resolve({ status: 404, data: {} }));
      const jobClient = new PrioritizedNodesJobClient(client);

      await expect(jobClient.getJobStatus(999)).rejects.toThrow('Failed to get job status');
    });
  });

  describe('startAndAwaitJob', () => {
    test('resolves immediately when job is already Completed', async () => {
      const completed = { ...baseJob, status: 'Completed' as const };
      const client = makeMockClient(() => Promise.resolve({ status: 201, data: completed }));
      const jobClient = new PrioritizedNodesJobClient(client);

      const result = await jobClient.startAndAwaitJob({ modelId: 100, revisionId: 200, nodeIds: [1] });

      expect(result.status).toBe('Completed');
    });

    test('throws immediately when job starts as Failed', async () => {
      const failed = { ...baseJob, status: 'Failed' as const, errorMessage: 'out of memory' };
      const client = makeMockClient(() => Promise.resolve({ status: 201, data: failed }));
      const jobClient = new PrioritizedNodesJobClient(client);

      await expect(
        jobClient.startAndAwaitJob({ modelId: 100, revisionId: 200, nodeIds: [1] })
      ).rejects.toThrow('out of memory');
    });

    test('polls until job completes', async () => {
      const queued = { ...baseJob, status: 'Queued' as const };
      const completed = { ...baseJob, status: 'Completed' as const };

      let getCallCount = 0;
      const client = makeMockClient(
        () => Promise.resolve({ status: 201, data: queued }),
        () => {
          getCallCount++;
          return Promise.resolve({ status: 200, data: getCallCount >= 2 ? completed : queued });
        }
      );
      const jobClient = new PrioritizedNodesJobClient(client);

      const result = await jobClient.startAndAwaitJob(
        { modelId: 100, revisionId: 200, nodeIds: [1] },
        1,
        30_000
      );

      expect(result.status).toBe('Completed');
      expect(getCallCount).toBeGreaterThanOrEqual(2);
    });

    test('throws when polling reveals a Failed status', async () => {
      const queued = { ...baseJob, status: 'Queued' as const };
      const failed = { ...baseJob, status: 'Failed' as const, errorMessage: 'server error' };

      const client = makeMockClient(
        () => Promise.resolve({ status: 201, data: queued }),
        () => Promise.resolve({ status: 200, data: failed })
      );
      const jobClient = new PrioritizedNodesJobClient(client);

      await expect(
        jobClient.startAndAwaitJob({ modelId: 100, revisionId: 200, nodeIds: [1] }, 1, 30_000)
      ).rejects.toThrow('server error');
    });

    test('throws on timeout', async () => {
      const queued = { ...baseJob, status: 'Queued' as const };

      const client = makeMockClient(
        () => Promise.resolve({ status: 201, data: queued }),
        () => Promise.resolve({ status: 200, data: queued })
      );
      const jobClient = new PrioritizedNodesJobClient(client);

      await expect(
        jobClient.startAndAwaitJob({ modelId: 100, revisionId: 200, nodeIds: [1] }, 1, 20)
      ).rejects.toThrow('timed out');
    });

    test('calls onStatusChange callback with each polled status', async () => {
      const completed = { ...baseJob, status: 'Completed' as const };
      const client = makeMockClient(() => Promise.resolve({ status: 201, data: completed }));
      const jobClient = new PrioritizedNodesJobClient(client);
      const onStatusChange = jest.fn();

      await jobClient.startAndAwaitJob({ modelId: 100, revisionId: 200, nodeIds: [1] }, 1, 30_000, onStatusChange);

      expect(onStatusChange).toHaveBeenCalledWith(completed);
    });
  });
});
