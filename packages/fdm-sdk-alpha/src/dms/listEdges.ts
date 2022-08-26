import { CogniteClient } from '@cognite/sdk';

import { postDMS } from '../utils/post';

import { Response, DMSError } from './types';

type Query = {
  limit?: number;
  cursor?: string;
  model: [string, string];
  filter: {
    and?: {
      in: {
        property: unknown;
        values: unknown;
      };
      range: {
        property: unknown;
        gte: number;
      };
    };
  };
  sort?: { property: string[]; direction: string; nullsFirst: boolean }[];
};

export const listEdges = async ({
  client,
  query,
}: {
  client: CogniteClient;
  query?: Query;
}): Promise<Response<{ externalId: string }> | DMSError> => {
  try {
    const response = await postDMS({
      client,
      data: query,
      url: 'edges/list',
    });

    return response;
  } catch (error) {
    // console.error(error);
    return error as DMSError;
  }
};
