import { CogniteClient } from '@cognite/sdk';

import { ModelNodeMap, ModelEdgeMap } from './dataModel';

const CDF_ALPHA_VERSION_HEADERS = { 'cdf-version': 'alpha' };

type ModelMap = ModelNodeMap & ModelEdgeMap;

const NUM_CONCURRENT_WORKERS = 10;
const INTERNAL_UPSERT_LIMIT = 1000;
const INTERNAL_DELETE_LIMIT = 1000;

interface UpsertOptions<T extends keyof ModelMap> {
  /** DMS model name */
  model: T;
  /** DMS space to adress */
  spaceExternalId: string;
  /** Model instances to upsert */
  items: ModelMap[T][];
}
async function upsertCommon<T extends keyof ModelMap>(
  dmsEndpoint: 'nodes' | 'edges',
  client: CogniteClient,
  options: UpsertOptions<T>
): Promise<ModelMap[T][]> {
  type Model = ModelMap[T];

  const resultChunks: { worker: number; items: Model[] }[] = [];
  const postModelsWorker = async (worker: number) => {
    // Get the slice from the items corresponding to the index of this worker
    const offset = worker * INTERNAL_UPSERT_LIMIT;
    const slice = options.items.slice(offset, offset + INTERNAL_UPSERT_LIMIT);
    // If slice is empty, can stop work altogether
    if (slice.length === 0) {
      return;
    }
    // Do the post request, gather results on success and throw on failure
    const res = await client.post<{ items: Model[] }>(
      `/api/v1/projects/${client.project}/datamodelstorage/${dmsEndpoint}`,
      {
        data: {
          items: slice,
          spaceExternalId: options.spaceExternalId,
          model: [options.spaceExternalId, options.model],
          overwrite: true,
          autoCreateStartNodes: dmsEndpoint === 'edges' ? false : undefined,
          autoCreateEndNodes: dmsEndpoint === 'edges' ? false : undefined,
        },
        headers: CDF_ALPHA_VERSION_HEADERS,
        responseType: 'json',
      }
    );
    if (res.status !== 200) {
      throw Error(
        `Unexpected status (${res.status}) during upsert of ${dmsEndpoint}: ${res}`
      );
    }
    resultChunks.push({ worker, items: res.data.items });

    // Work on the next slice 'NUM_CONCURRENT_WORKERS' positions further
    const nextWorker = worker + NUM_CONCURRENT_WORKERS;
    await postModelsWorker(nextWorker);
  };

  // Spawn 'NUM_CONCURRENT_WORKERS' to work concurrently on upserting
  const promises: Promise<void>[] = [];
  for (let w = 0; w < NUM_CONCURRENT_WORKERS; w += 1) {
    promises.push(postModelsWorker(w));
  }
  await Promise.all(promises);

  return (
    resultChunks
      // sort by worker index to reconstruct original order of items
      .sort((a, b) => a.worker - b.worker)
      // remove offset and reduce to only the items
      .flatMap((chunk) => chunk.items)
      // Add the "modelName" discriminator again
      .map((model) => {
        return { ...model, modelName: options.model } as Model;
      })
  );
}

export async function upsertNodes<T extends keyof ModelNodeMap>(
  client: CogniteClient,
  options: UpsertOptions<T>
): Promise<ModelMap[T][]> {
  return upsertCommon('nodes', client, options);
}

export async function upsertEdges<T extends keyof ModelEdgeMap>(
  client: CogniteClient,
  options: UpsertOptions<T>
): Promise<ModelMap[T][]> {
  // DMS currently runs into 409 errors when multiple process try to create
  // the direct relation in the 'type' field concurrently.
  // So we filter for edges with unique values for the "type" field and bootstrap them
  const uniqueTypes = new Set<string>();
  const itemsWithUniqueType = options.items.filter((item) => {
    if (!uniqueTypes.has(item.type[1])) {
      uniqueTypes.add(item.type[1]);
      return true;
    }
    return false;
  });
  // Bootstrapping
  await upsertCommon('edges', client, {
    model: options.model,
    spaceExternalId: options.spaceExternalId,
    items: itemsWithUniqueType,
  });

  // Concurrent upserting
  return upsertCommon('edges', client, options);
}

interface DeleteOptions<T extends { externalId: string }> {
  /** DMS space to adress */
  spaceExternalId: string;
  /** model instances to delete, referenced by externalId */
  items: T[];
}
export async function deleteCommon<T extends { externalId: string }>(
  nodesOrEdges: 'nodes' | 'edges',
  client: CogniteClient,
  options: DeleteOptions<T>
): Promise<void> {
  const reducedItems = options.items.map((item) => {
    return { externalId: item.externalId };
  });
  const deleteModelsWorker = async (worker: number) => {
    // Get the slice from the items corresponding to the index of this worker
    const offset = worker * INTERNAL_DELETE_LIMIT;
    const slice = reducedItems.slice(offset, offset + INTERNAL_DELETE_LIMIT);
    // If slice is empty, can stop work altogether
    if (slice.length === 0) {
      return;
    }
    // Do the post request, gather results on success and throw on failure
    const res = await client.post(
      `/api/v1/projects/${client.project}/datamodelstorage/${nodesOrEdges}/delete`,
      {
        data: {
          spaceExternalId: options.spaceExternalId,
          items: slice,
        },
        headers: CDF_ALPHA_VERSION_HEADERS,
        responseType: 'json',
      }
    );
    if (res.status !== 200) {
      throw Error(`Unexpected status (${res.status}) during delete: ${res}`);
    }

    // Work on the next slice 'NUM_CONCURRENT_WORKERS' positions further
    const nextWorker = worker + NUM_CONCURRENT_WORKERS;
    await deleteModelsWorker(nextWorker);
  };

  // Spawn 'NUM_CONCURRENT_WORKERS' to work concurrently on upserting
  const promises: Promise<void>[] = [];
  for (let w = 0; w < NUM_CONCURRENT_WORKERS; w += 1) {
    promises.push(deleteModelsWorker(w));
  }
  await Promise.all(promises);
}

export async function deleteNodes<T extends { externalId: string }>(
  client: CogniteClient,
  options: DeleteOptions<T>
): Promise<void> {
  return deleteCommon<T>('nodes', client, options);
}

export async function deleteEdges<T extends { externalId: string }>(
  client: CogniteClient,
  options: DeleteOptions<T>
): Promise<void> {
  return deleteCommon<T>('edges', client, options);
}

interface ListOptions<T extends keyof ModelMap> {
  /** DMS model name */
  model: T;
  /** DMS space to adress */
  spaceExternalId: string;
  /** Filters for model properties */
  filters: {
    property: string;
    values: any[];
  }[];
  /** Limit to the number of model instances to retrieve. Can be set to Infinity to retrieve all instances that match the query */
  limit: number;
}
async function listCommon<T extends keyof ModelMap>(
  nodesOrEdges: 'nodes' | 'edges',
  client: CogniteClient,
  options: ListOptions<T>
): Promise<ModelMap[T][]> {
  type Model = ModelMap[T];

  if (options.limit < 1) {
    throw Error('limit must be >= 1');
  }

  // Map filters to the filter format expected by DMS
  const filter =
    options.filters.length > 0
      ? {
          and: options.filters.map((f) => {
            return {
              in: {
                property: [options.spaceExternalId, options.model, f.property],
                values: f.values,
              },
            };
          }),
        }
      : {};

  const internalPaginationLimit = 1000;

  // Repeatedly call endpoint with cursor pagination until the requested limit is reached
  // or there are no more pages to fetch

  const data: {
    model: [string, string];
    filter: any;
    limit: number;
    cursor: string | undefined;
  } = {
    model: [options.spaceExternalId, options.model],
    filter,
    limit: internalPaginationLimit,
    cursor: undefined,
  };

  const resultItems: Model[] = [];
  let remaining: number;
  do {
    // adjust the limit for the next chunk if we would fetch more then the requested items
    remaining = options.limit - resultItems.length;
    if (remaining < data.limit) {
      data.limit = remaining;
    }

    // eslint-disable-next-line no-await-in-loop
    const response = await client.post<{
      items: Model[];
      nextCursor?: string;
    }>(
      `/api/v1/projects/${client.project}/datamodelstorage/${nodesOrEdges}/list`,
      {
        data,
        headers: CDF_ALPHA_VERSION_HEADERS,
        responseType: 'json',
      }
    );
    resultItems.push(...response.data.items);
    data.cursor = response.data.nextCursor;
  } while (remaining > 0 && data.cursor != null);

  // Add the "modelName" discriminator before returning
  return resultItems.map((item) => {
    return { ...item, modelName: options.model } as Model;
  });
}

export async function listNodes<T extends keyof ModelNodeMap>(
  client: CogniteClient,
  options: ListOptions<T>
): Promise<ModelMap[T][]> {
  return listCommon('nodes', client, options);
}

export async function listEdges<T extends keyof ModelEdgeMap>(
  client: CogniteClient,
  options: ListOptions<T>
): Promise<ModelMap[T][]> {
  return listCommon('edges', client, options);
}
