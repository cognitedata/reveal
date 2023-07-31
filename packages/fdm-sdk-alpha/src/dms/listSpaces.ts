import { CogniteClient } from '@cognite/sdk';

import { Response, DMSError } from './types';

// eslint-disable-next-line @typescript-eslint/ban-types
type Query = {};

export const listSpaces = async ({
  client,
  query,
}: {
  client: CogniteClient;
  query?: Query;
}): Promise<Response<{ externalId: string }> | DMSError> => {
  try {
    const response = await client.post(
      `api/v1/projects/${client.project}/datamodelstorage/spaces/list`,
      {
        data: query,
        headers: {
          'cdf-version': 'alpha',
        },
      }
    );

    return response;
  } catch (error) {
    // console.error(error);
    return error as DMSError;
  }
};
