import { CogniteClient } from '@cognite/sdk';

import { DmsNode, NodeAdapter } from './dataModel';

const CDF_ALPHA_VERSION_HEADERS = { 'cdf-version': 'alpha' };

export async function upsertNodes<N extends DmsNode>(
  client: CogniteClient,
  options: {
    /** Class type of the node */
    NodeAdapterType: NodeAdapter<N>;
    /** DMS space to adress */
    spaceExternalId: string;
    /** Nodes to upsert */
    items: N[];
  }
): Promise<N[]> {
  // Convert local node representation into format digestable by DMS
  const nodesBeforeUpsert: any[] = options.items.map((node) =>
    options.NodeAdapterType.sanitizeBeforeUpsert(node)
  );

  const data = {
    items: nodesBeforeUpsert,
    spaceExternalId: options.spaceExternalId,
    model: [options.spaceExternalId, options.NodeAdapterType.modelName],
    overwrite: true,
  };

  const res = await client.post(
    `/api/v1/projects/${client.project}/datamodelstorage/nodes`,
    {
      data,
      headers: CDF_ALPHA_VERSION_HEADERS,
      responseType: 'json',
    }
  );

  // Convert DMS node representation into local format
  const nodesAfterUpsert: N[] = res.data.items.map((node) =>
    options.NodeAdapterType.sanitizeAfterUpsert(node)
  );
  return nodesAfterUpsert;
}

export interface NodeFilter {
  property: string;
  values: any[];
}
export async function listNodes<N extends DmsNode>(
  client: CogniteClient,
  options: {
    /** Class type of the node */
    NodeAdapterType: NodeAdapter<N>;
    /** DMS space to adress */
    spaceExternalId: string;
    /** Filters for node properties */
    filters: NodeFilter[];
    /** Limit to the number of nodes to retrieve. Can be set to Infinity to retrieve all Nodes */
    limit: number;
  }
): Promise<N[]> {
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
                property: [
                  options.spaceExternalId,
                  options.NodeAdapterType.modelName,
                  f.property,
                ],
                values: f.values,
              },
            };
          }),
        }
      : {};

  const internalPaginationLimit = 1000;

  // Repeatedly call endpoint with cursor pagination until the requested limit is reached
  // or there are no more pages to fetch
  const data = {
    model: [options.spaceExternalId, options.NodeAdapterType.modelName],
    filter,
    limit: internalPaginationLimit,
    cursor: undefined,
  };
  const result: N[] = [];
  let remaining: number;
  do {
    // adjust the limit for the next chunk if we would fetch more then the requested items
    remaining = options.limit - result.length;
    if (remaining < data.limit) {
      data.limit = remaining;
    }

    // eslint-disable-next-line no-await-in-loop
    const response = await client.post(
      `/api/v1/projects/${client.project}/datamodelstorage/nodes/list`,
      {
        data,
        headers: CDF_ALPHA_VERSION_HEADERS,
        responseType: 'json',
      }
    );
    result.push(...(response.data.items as N[]));
    data.cursor = response.data.nextCursor;
  } while (remaining > 0 && data.cursor != null);
  return result;
}
