/*!
 * Copyright 2026 Cognite AS
 */
import { CogniteClient } from '@cognite/sdk';

export type PrioritizedNodesJobStatus = 'Queued' | 'Running' | 'Completed' | 'Failed';

export type PrioritizedNodesJobResponse = {
  jobId: number;
  modelId: number;
  revisionId: number;
  status: PrioritizedNodesJobStatus;
  createdTime: number;
  startTime?: number;
  finishedTime?: number;
  errorMessage?: string;
};

export type PrioritizedNodesJobRequest = {
  modelId: number;
  revisionId: number;
  nodeIds: number[];
};

/**
 * Client for triggering and polling PrioritizedNodes jobs via the CDF 3d/jobs endpoint.
 * These jobs produce a 'gltf-prioritized-nodes-directory' output containing
 * high-detail geometry for a subset of nodes.
 */
export class PrioritizedNodesJobClient {
  private readonly _client: CogniteClient;

  constructor(client: CogniteClient) {
    this._client = client;
  }

  /**
   * Triggers a PrioritizedNodes optimization job for the given model revision and node IDs.
   * @param request - The model/revision and node IDs to prioritize.
   * @returns The initial job response with jobId and status.
   */
  async startJob(request: PrioritizedNodesJobRequest): Promise<PrioritizedNodesJobResponse> {
    const url = `${this._client.getBaseUrl()}/api/v1/projects/${this._client.project}/3d/jobs`;

    const response = await this._client.post<PrioritizedNodesJobResponse>(url, {
      data: {
        type: 'PrioritizedNodes',
        items: {
          modelId: request.modelId,
          revisionId: request.revisionId,
          nodes: request.nodeIds.map(id => ({ id }))
        }
      }
    });

    if (response.status === 200 || response.status === 201) {
      return response.data;
    }

    throw new Error(`Failed to start PrioritizedNodes job: ${response.status} (${JSON.stringify(response.data)})`);
  }

  /**
   * Polls the status of an existing job.
   * @param jobId - The job ID returned by {@link startJob}.
   * @returns The current job status.
   */
  async getJobStatus(jobId: number): Promise<PrioritizedNodesJobResponse> {
    const url = `${this._client.getBaseUrl()}/api/v1/projects/${this._client.project}/3d/jobs/${jobId}`;

    const response = await this._client.get<PrioritizedNodesJobResponse>(url);

    if (response.status === 200) {
      return response.data;
    }

    throw new Error(`Failed to get job status: ${response.status} (${JSON.stringify(response.data)})`);
  }

  /**
   * Starts a PrioritizedNodes job and polls until it completes or fails.
   * @param request - The model/revision and node IDs to prioritize.
   * @param pollIntervalMs - How often to poll for status (default 5000ms).
   * @param timeoutMs - Maximum time to wait before giving up (default 10 minutes).
   * @param onStatusChange - Optional callback invoked each time the status is polled.
   * @returns The completed job response.
   * @throws If the job fails or times out.
   */
  async startAndAwaitJob(
    request: PrioritizedNodesJobRequest,
    pollIntervalMs: number = 5000,
    timeoutMs: number = 600_000,
    onStatusChange?: (status: PrioritizedNodesJobResponse) => void
  ): Promise<PrioritizedNodesJobResponse> {
    const job = await this.startJob(request);
    onStatusChange?.(job);

    if (job.status === 'Completed') {
      return job;
    }
    if (job.status === 'Failed') {
      throw new Error(`PrioritizedNodes job ${job.jobId} failed: ${job.errorMessage ?? 'unknown error'}`);
    }

    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      await sleep(pollIntervalMs);

      const status = await this.getJobStatus(job.jobId);
      onStatusChange?.(status);

      if (status.status === 'Completed') {
        return status;
      }
      if (status.status === 'Failed') {
        throw new Error(`PrioritizedNodes job ${job.jobId} failed: ${status.errorMessage ?? 'unknown error'}`);
      }
    }

    throw new Error(`PrioritizedNodes job ${job.jobId} timed out after ${timeoutMs}ms`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
