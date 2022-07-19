import { CogniteClient } from '@cognite/sdk';

import { Response, DMSError } from './types';

type Query = {
  limit?: number;
  filter: unknown;
  model: string[];
  sort?: unknown[];
  cursor?: string;
};

export const listNodes = async ({
  client,
  query,
}: {
  client: CogniteClient;
  query: Query;
}): Promise<Response<unknown> | DMSError> => {
  try {
    const createNodesResponse = await client.post(
      `api/v1/projects/${client.project}/datamodelstorage/nodes/list`,
      {
        data: query,
        headers: {
          'cdf-version': 'alpha',
        },
      }
    );

    return createNodesResponse;
  } catch (error) {
    // console.error(error);
    return error as DMSError;
  }
};
